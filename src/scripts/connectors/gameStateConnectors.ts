import { GameState } from "../objects/GameState";
import { FlowerType } from "../objects/FlowerType";
import { SEED_INTERVALS } from "../constants";
import { GuiController } from "../controllers/GuiController";
import { GameStateController } from "../controllers/GameStateController";
import { withLatestFrom, map, filter } from "rxjs/operators";
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
        withLatestFrom(gameStateController.gameStateObservable())
    ).subscribe(([_, gameState]) => {
        gameActionController.setPlayers(Object.keys(gameState.players));
        gameStateController.setGamePhase('ACTION');
    });

    gameActionController.endOfTurnObservable().subscribe(() => {
        gameStateController.setGamePhase("ACTION_RESOLUTION");
    })

    // Apply the end of turn delta
    gameStateController.gamePhaseObservable().pipe(
        filter(gamePhase => gamePhase === "APPLYING_DELTAS"),
        withLatestFrom(gameState$, gameDelta$, placedSeeds$)
    ).subscribe(([_, gameState, gameDelta, placedSeeds]) => {
        gameStateController.applyDelta(calculateFinalDelta(gameState, gameDelta, placedSeeds));
    });

    // Get the new state applied after ending turn
    gameStateController.gamePhaseObservable().pipe(
        filter(gamePhase => gamePhase === "RESETTING_ACTIONS"),
        withLatestFrom(gameState$),
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

                const status = getPlacementStatus(newState.tiles[tileIndex], newState, playerId, autoPlacedSeedsMap, type);
                
                if (status === "PLACEMENT_ALLOWED" && seedsRemainingByType[type] > 0) {
                    autoPlacedSeedsMap.addPlacedSeed(type, tileIndex, playerId);
                    seedsRemainingByType[type]--;
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
            const evolveDelta = applyEvolveResult(gameState, evolveChoice, currentPlayerId);
            gameStateController.applyDelta(evolveDelta);
        });
}

function calculateFinalDelta(gameState: GameState, gameDelta: GameStateDelta, placedSeedsMap: SeedTypeToPlacedSeedsMap): GameStateDelta {
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

    let newIndex = Math.max(0, ...Object.keys(gameState.flowersMap).map(type => parseInt(type))) + 1;
    placedSeedsMap.getAllSeeds()
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

function applyEvolveResult(gameState: GameState, evolveChoice: EvolutionChoice, currentPlayerId: string): GameStateDelta {
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
