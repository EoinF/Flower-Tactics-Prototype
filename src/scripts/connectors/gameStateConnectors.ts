import { GameState, GameStateData } from "../objects/GameState";
import { FlowerType } from "../objects/FlowerType";
import { SEED_INTERVALS } from "../constants";
import { GuiController } from "../controllers/GuiController";
import { GameStateController } from "../controllers/GameStateController";
import { withLatestFrom, map, mergeMap, skip, first, flatMap, take, switchMap } from "rxjs/operators";
import { GameDeltaController } from "../controllers/GameDeltaController";
import { EvolveSeedController, EvolutionChoice } from "../controllers/EvolveSeedController";
import { GameStateDelta } from "../objects/GameStateDelta";
import { isRequirementsSatisfied } from "../deltaCalculators/helpers";
import { PlacedSeed, GameActionController, SeedTypeToPlacedSeedsMap } from "../controllers/GameActionController";
import { StringMap } from "../types";
import { Flower } from "../objects/Flower";
import { FlowerAugmentation } from "../objects/FlowerAugmentation";
import { calculateSeedEvolutionOutcome, calculateSeedEvolutionResults } from "../deltaCalculators/calculateSeedEvolve";
import { gameStateController } from "../game";
import { indexToMapCoordinates } from "../widgets/utils";

export function setupGameStateManager(
    gameStateController: GameStateController,
    gameDeltaController: GameDeltaController,
    gameActionController: GameActionController,
    guiController: GuiController,
    evolveSeedController: EvolveSeedController
) {
    const gameState$ = gameStateController.gameStateObservable();
    const gameDelta$ = gameDeltaController.gameDeltaObservable();
    const currentPlayerId$ = gameStateController.currentPlayerObservable();
    const flowerNames$ = evolveSeedController.flowerNamesObservable();
    const stagedSeeds$ = evolveSeedController.stagedSeedsObservable();
    const onClickEvolveButton$ = guiController.onClickEvolveButtonObservable();
    const evolveChoices$ = evolveSeedController.evolveChoicesObservable();

    // Apply the end of turn delta
    guiController.endTurnObservable().pipe(
        withLatestFrom(gameState$, gameDelta$)
    ).subscribe(([_, gameState, gameDelta]) => {
        nextState(gameState, gameDelta);
    });

    // Get the new state applied after ending turn
    guiController.endTurnObservable().pipe(
        withLatestFrom(gameState$.pipe(skip(1))),
    ).subscribe(([_, newState]) => {
        const seedsRemainingByType: StringMap<number> = {};
        Object.keys(newState.seedStatus)
            .forEach(key => {
                seedsRemainingByType[key] = newState.seedStatus[key].quantity;
            });

        const autoPlacedSeedsMap = new SeedTypeToPlacedSeedsMap();

        Object.keys(newState.players).forEach(playerId => {
            Object.keys(newState.players[playerId].autoReplantTileMap).forEach(tileIndexKey => {
                const type = newState.players[playerId].autoReplantTileMap[tileIndexKey];
                const tileIndex = parseInt(tileIndexKey);

                const playerFlowers = newState.players[playerId].flowers;
                const { x, y } = indexToMapCoordinates(tileIndex, newState.numTilesX);
                const isFlowerBlockingTile = (newState.getFlowerIndexAtTile(newState.tiles[tileIndex]) != null);
                const isFlowerAdjacent = newState.getTilesAdjacent(x, y).some(adjacentTile => {
                    const flowerAtTile = newState.getFlowerIndexAtTile(adjacentTile);
                    return flowerAtTile != null && playerFlowers.indexOf(flowerAtTile) !== -1
                });

                if (!isFlowerBlockingTile && isFlowerAdjacent) {
                    if (seedsRemainingByType[type] > 0) {
                        autoPlacedSeedsMap.addPlacedSeed(type, tileIndex, playerId);
                        seedsRemainingByType[type]--;
                    }
                }
            });
        });

        gameActionController.resetClouds();
        gameActionController.resetSeeds(autoPlacedSeedsMap);
    });
    
    onClickEvolveButton$.pipe(
        withLatestFrom(gameState$, stagedSeeds$)
    ).subscribe(([_, gameState, stagedSeed]) => {
        if (stagedSeed != null) {
            const result = calculateSeedEvolutionOutcome(stagedSeed, gameState);
            evolveSeedController.setEvolveStatus(result);
        }
    });

    evolveSeedController.evolveStatusObservable()
        .pipe(
            withLatestFrom(gameState$, flowerNames$, stagedSeeds$)
        ).subscribe(([evolveStatus, gameState, flowerNames, _stagedSeeds]) => {
            const stagedSeeds = _stagedSeeds!;
            const seedsRequired = SEED_INTERVALS[stagedSeeds.stagedAmount];

            if (evolveStatus != 'FAILURE') {
                const evolutionResults = calculateSeedEvolutionResults(evolveStatus, stagedSeeds, gameState);
                
                const choices: EvolutionChoice[] = evolutionResults.map(result => ({
                    baseFlowerType: stagedSeeds.type,
                    newFlowerDelta: result,
                    newFlowerName: flowerNames[gameState.getNextRandomNumber(0, flowerNames.length - 1)],
                    seedsRequired
                }));
                evolveSeedController.setEvolveChoices(choices);
            } else {
                const failureDelta = new GameStateDelta();
                failureDelta.addDelta(["seedStatus", stagedSeeds.type, "quantity"], -seedsRequired);
                gameStateController.applyDelta(failureDelta);
            }
        });

    evolveSeedController.onSelectEvolveChoiceObservable()
        .pipe(
            withLatestFrom(evolveChoices$),
            map(([index, evolveChoice]) => evolveChoice[index]),
            withLatestFrom(gameState$, currentPlayerId$)
        )
        .subscribe(([evolveChoice, gameState, currentPlayerId]) => {
            applyEvolveResult(gameState, evolveChoice, currentPlayerId);
        });
}

function calculateFinalDelta(gameState: GameState, gameDelta: GameStateDelta): GameStateDelta {
    const finalDelta = gameDelta;

    Object.keys(gameState.flowersMap).forEach((key) => {
        const flower = gameState.flowersMap[key];
        const augmentations = gameState.flowerAugmentations[key] || [];
        const flowerStatsAfterAugmentation = applyAugmentations(gameState.flowerTypes[flower.type], augmentations);
        const tile = gameState.getTileAt(flower.x, flower.y)!;
        const isDying = !isRequirementsSatisfied(tile.soil, flowerStatsAfterAugmentation)
            || flower.growth >= (flowerStatsAfterAugmentation.turnsUntilDead + flowerStatsAfterAugmentation.turnsUntilGrown);

        if (isDying) {
            const {
                tenacity,
                turnsUntilGrown
            } = flowerStatsAfterAugmentation;
            const growthNeeded = Math.max(0, turnsUntilGrown - flower.growth);
            let survivalChance = tenacity - growthNeeded * 5;
            if (gameState.getNextRandomNumber(0, 99) >= survivalChance) {
                finalDelta.addDelta(["flowersMap", key], null, "DELTA_DELETE");
            }
        }
    });

    const placedSeeds = gameDelta.getIntermediateDelta<StringMap<PlacedSeed[]>>("placedSeeds") || {};
    let newIndex = Math.max(0, ...Object.keys(gameState.flowersMap).map(type => parseInt(type))) + 1;
    Object.keys(placedSeeds)
        .map(key => placedSeeds[key])
        .reduce((flatArray, nextArray) => [...flatArray, ...nextArray], []) // flatten
        .forEach((placedSeed) => {
            if (placedSeed.amount > 0) {
                const newFlower = {
                    x: placedSeed.tileIndex % gameState.numTilesX,
                    y: Math.floor(placedSeed.tileIndex / gameState.numTilesX),
                    type: placedSeed.type,
                    growth: 0
                } as Flower;
                finalDelta.addDelta(["flowersMap", newIndex.toString()], newFlower, "DELTA_REPLACE");
                finalDelta.addDelta(["players", placedSeed.ownerId, "flowers"], newIndex.toString(), "DELTA_APPEND");

                if (isRequirementsSatisfied(gameState.tiles[placedSeed.tileIndex].soil, gameState.flowerTypes[placedSeed.type])) {
                    finalDelta.addDelta(["players", placedSeed.ownerId, "autoReplantTileMap", placedSeed.tileIndex.toString()], placedSeed.type, "DELTA_REPLACE");
                }
                newIndex++;
            }
        });
    return finalDelta;
}

function nextState(gameState: GameState, gameDelta: GameStateDelta) {
    gameStateController.applyDelta(calculateFinalDelta(gameState, gameDelta));
}

export function applyDeltas<T>(gameData: T, deltas: GameStateDelta): T {
    deltas.getDeltas().forEach(delta => {
        const currentEntry = delta.keys.slice(0, delta.keys.length - 1).reduce((currentEntry, key) => {
            return currentEntry[key];
        }, gameData) as any;
        const lastKey = delta.keys[delta.keys.length - 1];

        if (delta.deltaType === "DELTA_ADD") {
            if (!(lastKey in currentEntry)) {
                throw Error(`Tried to apply DELTA_ADD to non existent key ${delta.keys} for ${currentEntry}`);
            }
            currentEntry[lastKey] += delta.deltaValue as number;
        } else if (delta.deltaType === "DELTA_REMOVE") {
            const entriesToRemove = delta.deltaValue as Array<any>;
            currentEntry[lastKey] = currentEntry[lastKey].filter((_, index) => entriesToRemove.indexOf(index) === -1);
        } else if (delta.deltaType === "DELTA_DELETE") {
            delete currentEntry[lastKey];
        } else if (delta.deltaType === "DELTA_REPLACE") {
            currentEntry[lastKey] = delta.deltaValue;
        } else if (delta.deltaType === "DELTA_APPEND") {
            currentEntry[lastKey] = [ ...currentEntry[lastKey], ...(delta.deltaValue as Array<any>) ];
        }
    });
    return gameData;
}

function applyEvolveResult(gameState: GameState, evolveChoice: EvolutionChoice, currentPlayerId: string) {
    const existingFlowerCopy = JSON.parse(JSON.stringify(gameState.flowerTypes[evolveChoice.baseFlowerType])) as FlowerType;
    const existingTypes = Object.keys(gameState.flowerTypes).map(type => parseInt(type));
    const nextType = (Math.max(...existingTypes) + 1).toString();

    const evolveDelta = new GameStateDelta();

    const newFlower = {
        ...applyDeltas(existingFlowerCopy, evolveChoice.newFlowerDelta),
        name: evolveChoice.newFlowerName,
        type: nextType
    }
    evolveDelta.addDelta(["flowerTypes", nextType], newFlower, "DELTA_REPLACE");
    evolveDelta.addDelta(["seedStatus", nextType], {
        type: newFlower.type,
        quantity: 1,
        progress: 0
    }, "DELTA_REPLACE");
    evolveDelta.addDelta(["seedStatus", evolveChoice.baseFlowerType, "quantity"], - evolveChoice.seedsRequired);
    evolveDelta.addDelta(["players", currentPlayerId, "seedsOwned"], newFlower.type, "DELTA_APPEND");
    gameStateController.applyDelta(evolveDelta);
}

function applyAugmentations(flowerType: FlowerType, flowerAugmentations: FlowerAugmentation[]): FlowerType {
    let augmentedFlowerStats = {...flowerType};
    flowerAugmentations.forEach((augmentation: FlowerAugmentation) => {
        if (augmentation.type === "tenacity") {
            augmentedFlowerStats = {
                ...augmentedFlowerStats,
                tenacity: augmentedFlowerStats.tenacity + augmentation.strength
            }
        } else {
            console.warn('Warning: Unknown augmentation type', augmentation);
        }
    }, flowerType);
    return augmentedFlowerStats;
}
