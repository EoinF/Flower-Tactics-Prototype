import { GameState } from "../objects/GameState";
import { FlowerType } from "../objects/FlowerType";
import { SEED_INTERVALS, APPLYING_DELTAS_DURATION, RESETTING_ACTIONS_DURATION, ACTION_RESOLUTION_DURATION } from "../constants";
import { GuiController } from "../controllers/GuiController";
import { GameStateController } from "../controllers/GameStateController";
import { withLatestFrom, map, filter, tap, delay, publish, subscribeOn } from "rxjs/operators";
import { GameDeltaController } from "../controllers/GameDeltaController";
import { EvolveSeedController, EvolutionChoice } from "../controllers/EvolveSeedController";
import { GameStateDelta } from "../objects/GameStateDelta";
import { isRequirementsSatisfied } from "../deltaCalculators/helpers";
import { PlacedSeed, GameActionController, SeedTypeToPlacedSeedsMap } from "../controllers/GameActionController";
import { StringMap } from "../types";
import { Flower } from "../objects/Flower";
import { FlowerAugmentation } from "../objects/FlowerAugmentation";
import { calculateSeedEvolutionOutcome, calculateSeedEvolutionResults } from "../deltaCalculators/calculateSeedEvolve";
import { getPlacementStatus } from "./utils";

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
    const placedSeeds$ = gameActionController.placedSeedsMapObservable();

    gameStateController.gamePhaseObservable().pipe(
        filter(gamePhase => gamePhase === 'INIT'),
        withLatestFrom(gameStateController.gameStateObservable()),
        tap(([_, gameState]) => {
            gameActionController.setPlayers(Object.keys(gameState.players));
        }),
        // This is scheduled for later to avoid the weirdness of ACTION phase
        // showing up before INIT phase in other subscriptions 
        // (Because INIT is not yet done emitting, and calling subject.next will immediately emit the next event)
        delay(1)
    ).subscribe(() => {
        gameStateController.setGamePhase('ACTION');
    });

    gameActionController.endOfTurnObservable().pipe(
        tap(() => {
            gameStateController.setGamePhase("ACTION_RESOLUTION");
        }),
        delay(ACTION_RESOLUTION_DURATION)
    ).subscribe(() => {
        gameStateController.setGamePhase("APPLYING_DELTAS");
    })

    // Apply the end of turn delta
    gameStateController.gamePhaseObservable().pipe(
        filter(gamePhase => gamePhase === "APPLYING_DELTAS"),
        withLatestFrom(gameState$, gameDelta$, placedSeeds$),
        tap(([_, gameState, gameDelta, placedSeeds]) => {
            gameStateController.applyDelta(calculateFinalDelta(gameState, gameDelta, placedSeeds));
        }),
        delay(APPLYING_DELTAS_DURATION)
    ).subscribe(() => {
        gameStateController.setGamePhase("RESETTING_ACTIONS");
    })

    // Get the new state applied after ending turn
    gameStateController.gamePhaseObservable().pipe(
        filter(gamePhase => gamePhase === "RESETTING_ACTIONS"),
        withLatestFrom(gameState$),
        tap(([_, newState]) => {
            const seedsRemainingByType: StringMap<number> = {};
            Object.keys(newState.seedStatus)
                .forEach(key => {
                    seedsRemainingByType[key] = newState.seedStatus[key].quantity;
                });

            const autoPlacedSeedsMap = new SeedTypeToPlacedSeedsMap();

            Object.keys(newState.players).forEach(playerId => {
                if (newState.players[playerId].controlledBy === 'Human' || newState.players[playerId].controlledBy === 'None') {
                    Object.keys(newState.players[playerId].autoReplantTileMap).forEach(tileIndexKey => {
                        const type = newState.players[playerId].autoReplantTileMap[tileIndexKey];
                        const tileIndex = parseInt(tileIndexKey);

                        const status = getPlacementStatus(newState.tiles[tileIndex], newState, playerId, autoPlacedSeedsMap, type);
                        
                        if (status === "PLACEMENT_ALLOWED" && seedsRemainingByType[type] > 0) {
                            autoPlacedSeedsMap.addPlacedSeed(type, tileIndex, playerId);
                            seedsRemainingByType[type]--;
                        }
                    });
                }
            });

            gameActionController.resetClouds();
            gameActionController.resetSeeds(autoPlacedSeedsMap);
        }),
        delay(RESETTING_ACTIONS_DURATION)
    ).subscribe(() => {
        gameStateController.setGamePhase("ACTION");
    })
    
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
            const evolveDelta = getEvolveResultDelta(gameState, evolveChoice, currentPlayerId);
            gameStateController.applyDelta(evolveDelta);
        });
}

function calculateFinalDelta(gameState: GameState, gameDelta: GameStateDelta, placedSeedsMap: SeedTypeToPlacedSeedsMap): GameStateDelta {
    const finalDelta = gameDelta;

    Object.keys(gameState.flowersMap).forEach((flowerKey) => {
        const flower = gameState.flowersMap[flowerKey];
        const augmentations = gameState.flowerAugmentations[flowerKey] || [];
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
                const ownerId = Object.keys(gameState.players).find(key => gameState.players[key].flowers.indexOf(flowerKey) !== -1)!;
                const ownerFlowerIndex = gameState.players[ownerId].flowers.indexOf(flowerKey);
                finalDelta.addDelta(["flowersMap", flowerKey], null, "DELTA_DELETE");
                finalDelta.addDelta(["players", ownerId, "flowers"], ownerFlowerIndex, "DELTA_REMOVE");
            }
        }
    });

    let newIndex = Math.max(0, ...Object.keys(gameState.flowersMap).map(type => parseInt(type))) + 1;
    placedSeedsMap.getAllSeeds()
        .filter(seed => seed.amount > 0)
        .reduce<PlacedSeed[][]>((groupings, nextSeed) => {
            const matchingSeedIndex = groupings.findIndex(
                group => {
                    return (group.length === 1) && (group[0].tileIndex === nextSeed.tileIndex)}
            );
            if (matchingSeedIndex !== -1) {
                groupings[matchingSeedIndex].push(nextSeed);
                return groupings;
            } else {
                return [...groupings, [nextSeed]];
            }
        }, [])
        .forEach(placedSeedGroup => {
            let winningSeed: PlacedSeed | null = placedSeedGroup[0];
            if (placedSeedGroup.length > 1) {
                if (placedSeedGroup[0].amount > placedSeedGroup[1].amount) {
                    winningSeed = placedSeedGroup[0];
                } else if (placedSeedGroup[1].amount > placedSeedGroup[0].amount) {
                    winningSeed = placedSeedGroup[1];
                } else {
                    winningSeed = null
                }
            }

            if (winningSeed != null) {
                const newFlower = {
                    x: winningSeed.tileIndex % gameState.numTilesX,
                    y: Math.floor(winningSeed.tileIndex / gameState.numTilesX),
                    type: winningSeed.type,
                    growth: 0
                } as Flower;
                finalDelta.addDelta(["flowersMap", newIndex.toString()], newFlower, "DELTA_REPLACE");
                finalDelta.addDelta(["players", winningSeed.ownerId, "flowers"], newIndex.toString(), "DELTA_APPEND");

                if (isRequirementsSatisfied(gameState.tiles[winningSeed.tileIndex].soil, gameState.flowerTypes[winningSeed.type])) {
                    finalDelta.addDelta(["players", winningSeed.ownerId, "autoReplantTileMap", winningSeed.tileIndex.toString()], winningSeed.type, "DELTA_REPLACE");
                }
                newIndex++;
            }
        });
    return finalDelta;
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

export function getEvolveResultDelta(gameState: GameState, evolveChoice: EvolutionChoice, currentPlayerId: string): GameStateDelta {
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
    return evolveDelta;
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
