import { GameStateController } from "../controllers/GameStateController";
import { GameActionController, PlacedSeed, SeedTypeToPlacedSeedsMap } from "../controllers/GameActionController";
import { withLatestFrom, filter, skip, switchMap } from "rxjs/operators";
import { GameState } from "../objects/GameState";
import { getPlacementStatus } from "./utils";
import { isRequirementsSatisfied } from "../deltaCalculators/helpers";
import { calculateSeedEvolutionResults, calculateSeedEvolutionOutcome } from "../deltaCalculators/calculateSeedEvolve";
import { SEED_INTERVALS } from "../constants";
import { getEvolveResultDelta } from "./gameStateConnectors";
import { EvolutionChoice, EvolveSeedController } from "../controllers/EvolveSeedController";
import { indexToMapCoordinates } from "../widgets/utils";
import { FlowerType } from "../objects/FlowerType";

interface PlacedCloud {
    id: string;
    tileIndex: number;
}

interface SeedsAvailable {
    amount: number;
    type: string;
    flowerStats: FlowerType;
}

export function setupAIConnectors(gameStateController: GameStateController, gameActionController: GameActionController, evolveSeedController: EvolveSeedController) {
    gameStateController.gamePhaseObservable().pipe(
        withLatestFrom(gameStateController.gamePhaseObservable().pipe(skip(1))),
        filter(([_, phase]) => phase === 'ACTION'),
        switchMap(() => gameStateController.gamePhaseObservable())
    ).pipe(
        filter(phase => phase === 'ACTION'),
        withLatestFrom(
            gameStateController.gameStateObservable(),
            gameActionController.placedSeedsMapObservable(),
            gameActionController.placedCloudsObservable(),
            evolveSeedController.flowerNamesObservable()
        )
    ).subscribe(([_, gameState, placedSeeds, placedCloud, flowerNames]) => {
        Object.keys(gameState.players)
            .filter(playerId => gameState.players[playerId].controlledBy === 'AI_1' ||
                gameState.players[playerId].controlledBy === 'AI_2')
            .forEach(playerId => {
                const ownPlacedSeeds = placedSeeds.getAllSeeds().filter(
                    placedSeed => placedSeed.ownerId === playerId
                );
                const ownedCloudID = gameState.players[playerId].cloudOwned;
                const ownedCloud = ownedCloudID != null ?
                    { id: ownedCloudID, tileIndex: placedCloud[ownedCloudID] }
                    : null;
                act(playerId, gameState, ownPlacedSeeds, placedSeeds.clone(), ownedCloud, flowerNames, gameStateController, gameActionController)
            })
    })
}

function act(playerId: string, gameState: GameState, ownPlacedSeeds: PlacedSeed[],
    placedSeedsMap: SeedTypeToPlacedSeedsMap, ownedCloud: PlacedCloud | null, flowerNames: string[],
    gameStateController: GameStateController, gameActionController: GameActionController
) {    
    const uniqueTiles = getUniqueTilesForPlacement(gameState, playerId);

    const reversedSeedsOwned = [...gameState.players[playerId].seedsOwned].reverse();
    reversedSeedsOwned.forEach((key) => {
        const seedStatus = gameState.seedStatus[key];
        const seedsAvailable: SeedsAvailable = {
            amount: seedStatus.quantity - ownPlacedSeeds
                .filter(seed => seed.type === seedStatus.type)
                .reduce((total, nextSeed) => nextSeed.amount + total, 0),
            type: seedStatus.type,
            flowerStats: gameState.flowerTypes[seedStatus.type]
        }

        const opponentAdjacentTiles = tryPlaceSeeds(uniqueTiles, seedsAvailable, playerId, gameState, placedSeedsMap, gameActionController);

        if (opponentAdjacentTiles.length > 0) {
            placeCompetingSeeds(seedsAvailable, opponentAdjacentTiles, gameState, playerId, placedSeedsMap, gameActionController);
        }

        if (seedsAvailable.amount > 50) {
            tryEvolveSeed(seedsAvailable, gameState, flowerNames, playerId, gameStateController);
        }
    });
    gameActionController.endTurn(playerId);
}

function getUniqueTilesForPlacement(gameState: GameState, playerId: string) {
    const ownedFlowers = gameState.players[playerId].flowers.map(
        flowerKey => gameState.flowersMap[flowerKey]
    );

    let adjacentTiles: number[] = [];
    ownedFlowers.forEach(flower => {
        adjacentTiles = [
            ...adjacentTiles, 
            ...gameState.getTilesAdjacent(flower.x, flower.y).map(tile => tile.index)
        ];
    });

    return Array.from(new Set(adjacentTiles));
}

function tryPlaceSeeds(uniqueTiles: number[], seedsAvailable: SeedsAvailable, playerId: string, gameState: GameState,
    placedSeedsMap: SeedTypeToPlacedSeedsMap, gameActionController: GameActionController
) {
    const opponentAdjacentTiles: number[] = [];
    for (let i = 0; i < uniqueTiles.length && seedsAvailable.amount > 0; i++) {
        const tileIndex = uniqueTiles[i];
        if (
            !placedSeedsMap.getSeedsAtTile(tileIndex).find(seed => seed.ownerId === playerId) &&
            isRequirementsSatisfied(gameState.tiles[tileIndex].soil, seedsAvailable.flowerStats) &&
            getPlacementStatus(gameState.tiles[tileIndex], gameState, playerId, placedSeedsMap, seedsAvailable.type) === 'PLACEMENT_ALLOWED'
        ) {
            gameActionController.placeSeed(seedsAvailable.type, tileIndex, playerId);
            placedSeedsMap.addPlacedSeed(seedsAvailable.type, tileIndex, playerId);
            seedsAvailable.amount--;
            
            if (gameState.players[playerId].controlledBy === 'AI_2') {
                // Try to challenge the opponents
                const tileXY = indexToMapCoordinates(tileIndex, gameState.numTilesX);
                const isOpponentAdjacent = gameState.getTilesAdjacent(tileXY.x, tileXY.y).some(
                    (otherTile) => {
                        const flowerIndex = gameState.getFlowerIndexAtTile(otherTile);
                        return flowerIndex != null && gameState.players[playerId].flowers.indexOf(flowerIndex) === -1;
                    }
                );
                if (isOpponentAdjacent) {
                    opponentAdjacentTiles.push(tileIndex);
                }
            }
        }
    }
    return Array.from(new Set(opponentAdjacentTiles));
}

function tryEvolveSeed(seedsAvailable: SeedsAvailable, gameState: GameState, flowerNames: string[], playerId: string, 
    gameStateController: GameStateController
) {
    const stagedSeed = {type: seedsAvailable.type, stagedAmount: 0};
    while (stagedSeed.stagedAmount < SEED_INTERVALS.length
        && seedsAvailable.amount > SEED_INTERVALS[stagedSeed.stagedAmount + 1]
    ) {
        stagedSeed.stagedAmount++;
    }
    const seedsRequired = SEED_INTERVALS[stagedSeed.stagedAmount];
    
    const outcome = calculateSeedEvolutionOutcome(stagedSeed, gameState);
    const evolutionResults = calculateSeedEvolutionResults(outcome, stagedSeed, gameState);

    const choices: EvolutionChoice[] = evolutionResults.map(result => ({
        baseFlowerType: stagedSeed.type,
        newFlowerDelta: result,
        newFlowerName: flowerNames[gameState.getNextRandomNumber(0, flowerNames.length - 1)],
        seedsRequired
    }));
    seedsAvailable.amount -= seedsRequired;
    gameStateController.applyDelta(getEvolveResultDelta(gameState, choices[0], playerId));
}

function placeCompetingSeeds(seedsAvailable: SeedsAvailable, opponentAdjacentTiles: number[], gameState: GameState, 
    playerId: string, placedSeedsMap: SeedTypeToPlacedSeedsMap, gameActionController: GameActionController
) {
    let seedsToUse = gameState.getNextRandomNumber(0, seedsAvailable.amount);

    while(seedsToUse > 0) {
        const roll = gameState.getNextRandomNumber(0, opponentAdjacentTiles.length - 1);
        const tileIndex = opponentAdjacentTiles[roll];
        gameActionController.placeSeed(seedsAvailable.type, tileIndex, playerId);
        placedSeedsMap.addPlacedSeed(seedsAvailable.type, tileIndex, playerId);
        seedsAvailable.amount--;
        seedsToUse--;
    }
}