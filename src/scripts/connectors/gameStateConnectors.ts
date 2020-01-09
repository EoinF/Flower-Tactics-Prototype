import { GameState, GameStateData } from "../objects/GameState";
import { FlowerType } from "../objects/FlowerType";
import { CLOUD_GRID_WIDTH, SEED_INTERVALS } from "../constants";
import { GameStateDelta } from "./gameDeltaConnectors";
import { GuiController } from "../controllers/GuiController";
import { GameStateController } from "../controllers/GameStateController";
import { withLatestFrom, map } from "rxjs/operators";
import { GameDeltaController } from "../controllers/GameDeltaController";
import { EvolveSeedController } from "../controllers/EvolveSeedController";
import { calculateSeedEvolve } from "../deltaCalculators/calculateSeedEvolve";

export function setupGameStateManager(
    gameStateController: GameStateController,
    gameDeltaController: GameDeltaController,
    guiController: GuiController,
    evolveSeedController: EvolveSeedController
) {
    const gameState$ = gameStateController.gameStateObservable();
    const gameDelta$ = gameDeltaController.gameDeltaObservable();
    const flowerNames$ = evolveSeedController.flowerNamesObservable();
    const stagedSeeds$ = evolveSeedController.stagedSeedsObservable();
    const onClickEvolveButton$ = guiController.onClickEvolveButtonObservable();

    guiController.endTurnObservable().pipe(
        withLatestFrom(gameState$, gameDelta$)
    ).subscribe(([_, gameState, gameDelta]) => {
        gameStateController.setState(nextState(gameState, gameDelta));
    });
    
    onClickEvolveButton$.pipe(
        withLatestFrom(gameState$, flowerNames$),
        map(([_, gameState, flowerNames]) => {
            return flowerNames[gameState.getNextRandomNumber(0, flowerNames.length - 1)];
        }),
        withLatestFrom(gameState$, stagedSeeds$)
    ).subscribe(([newFlowerName, gameState, stagedSeed]) => {
        if (stagedSeed != null) {
            const result = calculateSeedEvolve(stagedSeed, gameState, newFlowerName);
            evolveSeedController.setEvolveStatus(result.outcomeType);

            const seedsToDelete = [{
                type: stagedSeed.type,
                amount: SEED_INTERVALS[stagedSeed.stagedAmount]
            }];

            if (result.outcomeType != 'FAILURE' && result.newFlower != null) {
                gameStateController.setState(applyEvolveResult(gameState, seedsToDelete, result.newFlower));
            } else {
                gameStateController.setState(deleteSeeds(gameState, seedsToDelete));
            }
        }
    })
}

function getCopiedState(gameState: GameState): GameStateData {
    const nextRandomNumberSeed = gameState!.getRandomNumberSeed();
    const copiedData = JSON.parse(JSON.stringify(gameState)) as GameStateData;
    return {
        ...copiedData, randomNumberGeneratorSeed: nextRandomNumberSeed
    };
}

function nextState(gameState: GameState, gameDelta: GameStateDelta) {
    const copiedData = getCopiedState(gameState);

    const {
        tileSoilDelta,
        flowerDelta,
        seedStatusDelta,
        placedSeeds,
        placedCloudTileIndex
    } = gameDelta;

    let flowersToRemove: string[] = [];
    Object.keys(gameState.flowersMap).forEach((key) => {
        const { growth, isNourished } = flowerDelta[key]!;
        if (isNourished) {
            copiedData.flowersMap[key].growth += growth;
        } else {
            const {
                tenacity,
                turnsUntilGrown
            } = copiedData.flowerTypes[gameState.flowersMap[key].type];
            const growthNeeded = turnsUntilGrown - copiedData.flowersMap[key].growth;
            let survivalChance = tenacity - growthNeeded * 5;
            if (gameState.getNextRandomNumber(0, 99) >= survivalChance) {
                flowersToRemove.push(key);
            }
        }
    });
    
    flowersToRemove.forEach((key) => {
        const flower = gameState.flowersMap[key];
        const tile = gameState.getTileAt(flower.x, flower.y)!;
        const {
            soilConsumptionRate
        } = gameState.flowerTypes[flower.type];
        const returnedNutrients = soilConsumptionRate * flower.growth;
        tileSoilDelta[tile.index].nitrogen += returnedNutrients;
        tileSoilDelta[tile.index].phosphorous += returnedNutrients;
        tileSoilDelta[tile.index].potassium += returnedNutrients;
    });

    tileSoilDelta.forEach((soilDelta, tileIndex) => {
        copiedData.tiles[tileIndex].soil.nitrogenContent += soilDelta.nitrogen;
        copiedData.tiles[tileIndex].soil.phosphorousContent += soilDelta.phosphorous;
        copiedData.tiles[tileIndex].soil.potassiumContent += soilDelta.potassium;
    });
    
    let rainFallTiles: number[] = [];

    if (placedCloudTileIndex != null) {
        const cloudLayout = gameState.getCloudLayout();
        rainFallTiles = cloudLayout.map((isPlaced, index) => {
            if (isPlaced) {
                const x = Math.floor(index / CLOUD_GRID_WIDTH)
                const y = index % CLOUD_GRID_WIDTH;
                return placedCloudTileIndex + x + (y * gameState.numTilesX);
            } else {
                return null;
            }
        })
        .filter(tileIndex => tileIndex != null)
        .map(tileIndex => tileIndex!);
    }

    copiedData.tiles.forEach((_, tileIndex) => {
        let waterDelta: number;
        if (rainFallTiles.indexOf(tileIndex) !== -1) {
            waterDelta = +3; // Rainfall adds 3 turns of water content to a tile
        } else if (copiedData.tiles[tileIndex].waterContent > 0) {
            waterDelta = -1; // Water content degrades by 1 per turn
        } else {
            waterDelta = 0;
        }
        copiedData.tiles[tileIndex].waterContent += waterDelta;
    });
    
    Object.keys(placedSeeds).forEach(type => {
        placedSeeds[type].forEach((seedAmount, tileIndex) => {
            if (seedAmount > 0) {
                const newIndex = Math.max(...Object.keys(copiedData.flowersMap).map(type => parseInt(type))) + 1;
                copiedData.flowersMap[newIndex] = {
                    index: newIndex,
                    x: tileIndex % gameState.numTilesX,
                    y: Math.floor(tileIndex / gameState.numTilesX),
                    type,
                    growth: 0
                };
            }
        })
    });

    Object.keys(seedStatusDelta).forEach((type) => {
        const seedDelta = seedStatusDelta[type];
        const copiedSeedStatus = copiedData.seedStatus[type];
        copiedSeedStatus.progress += seedDelta.progress;
        copiedSeedStatus.quantity += seedDelta.quantity + Math.floor(copiedSeedStatus.progress / 100);
        copiedSeedStatus.progress %= 100;
    });

    flowersToRemove.forEach(key => {
        delete copiedData.flowersMap[key];
    });

    const newState = new GameState(copiedData);
    newState.generateNextCloudLayout();
    return newState;
}

function applyEvolveResult(gameState: GameState, seeds: Array<{type: string, amount: number}>, newFlower: FlowerType) {
    const copiedData = getCopiedState(gameState);
    copiedData.flowerTypes[newFlower.type] = newFlower;
    copiedData.seedStatus[newFlower.type] = {
        type: newFlower.type,
        quantity: 1,
        progress: 0
    };
    seeds.forEach((seed) => {
        copiedData.seedStatus[seed.type].quantity -= seed.amount;
    });
    return new GameState(copiedData);
}

function deleteSeeds(gameState: GameState, seeds: Array<{type: string, amount: number}>) {
    seeds.forEach((seed) => {
        gameState.seedStatus[seed.type].quantity -= seed.amount;
    });
    return gameState;
}
