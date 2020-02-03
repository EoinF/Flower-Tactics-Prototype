import { GameStateController } from "../controllers/GameStateController";
import { GameActionController, PlacedSeed, SeedTypeToPlacedSeedsMap } from "../controllers/GameActionController";
import { merge } from "rxjs";
import { withLatestFrom, filter, mergeMap, tap, skip, switchMap } from "rxjs/operators";
import { GameState } from "../objects/GameState";
import { getPlacementStatus } from "./utils";
import { isRequirementsSatisfied } from "../deltaCalculators/helpers";

interface PlacedCloud {
    id: string;
    tileIndex: number;
}

export function setupAIConnectors(gameStateController: GameStateController, gameActionController: GameActionController) {
    gameStateController.gamePhaseObservable().pipe(
        withLatestFrom(gameStateController.gamePhaseObservable().pipe(skip(1))),
        filter(([_, phase]) => phase === 'ACTION'),
        switchMap(() => gameStateController.gamePhaseObservable())
    ).pipe(
        filter(phase => phase === 'ACTION'),
        withLatestFrom(
            gameStateController.gameStateObservable(),
            gameActionController.placedSeedsMapObservable(),
            gameActionController.placedCloudsObservable()
        )
    ).subscribe(([_, gameState, placedSeeds, placedCloud]) => {
        Object.keys(gameState.players)
            .filter(playerId => gameState.players[playerId].controlledBy === 'AI')
            .forEach(playerId => {
                const ownPlacedSeeds = placedSeeds.getAllSeeds().filter(
                    placedSeed => placedSeed.ownerId === playerId
                );
                const ownedCloudID = gameState.players[playerId].cloudOwned;
                const ownedCloud = { id: ownedCloudID, tileIndex: placedCloud[ownedCloudID] };
                act(playerId, gameState, ownPlacedSeeds, placedSeeds, ownedCloud, gameActionController)
            })
    })
}

function act(playerId: string, gameState: GameState, ownPlacedSeeds: PlacedSeed[], placedSeedsMap: SeedTypeToPlacedSeedsMap, ownedCloud: PlacedCloud, 
    gameActionController: GameActionController
) {
    const seedStatus = gameState.seedStatus[gameState.players[playerId].seedsOwned[0]];
    const seedsAvailable = {
        amount: seedStatus.quantity - ownPlacedSeeds
            .filter(seed => seed.type === seedStatus.type)
            .reduce((total, nextSeed) => nextSeed.amount + total, 0),
        type: seedStatus.type,
        flowerStats: gameState.flowerTypes[seedStatus.type]
    }

    const ownedFlowers = Object.keys(gameState.flowersMap)
        .filter(flowerKey => gameState.players[playerId].flowers.indexOf(flowerKey) !== -1)
        .map(flowerKey => gameState.flowersMap[flowerKey]);

    for (let flowerIndex = 0; flowerIndex < ownedFlowers.length && seedsAvailable.amount > 0; flowerIndex++) {
        const flower = ownedFlowers[flowerIndex];
        const adjacentTiles = gameState.getTilesAdjacent(flower.x, flower.y);
        adjacentTiles.forEach(tile => {
            if (
                placedSeedsMap.getSeedsAtTile(tile.index).find(seed => seed.ownerId === playerId) == null &&
                isRequirementsSatisfied(tile.soil, seedsAvailable.flowerStats) &&
                seedsAvailable.amount > 0 &&
                getPlacementStatus(tile, gameState, playerId, placedSeedsMap, seedsAvailable.type) === 'PLACEMENT_ALLOWED'
            ) {
                gameActionController.placeSeed(seedsAvailable.type, tile.index, playerId);
            }
        });
    }
    gameActionController.endTurn(playerId);
}