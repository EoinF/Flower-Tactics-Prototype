import { GameState, GameStateData } from "../objects/GameState";
import { FlowerType } from "../objects/FlowerType";
import { CLOUD_GRID_WIDTH, SEED_INTERVALS } from "../constants";
import { GuiController } from "../controllers/GuiController";
import { GameStateController } from "../controllers/GameStateController";
import { withLatestFrom, map } from "rxjs/operators";
import { GameDeltaController } from "../controllers/GameDeltaController";
import { EvolveSeedController } from "../controllers/EvolveSeedController";
import { calculateSeedEvolve } from "../deltaCalculators/calculateSeedEvolve";
import { GameStateDelta } from "../objects/GameStateDelta";
import { isRequirementsSatisfied } from "../deltaCalculators/helpers";
import { PlacedSeed } from "../controllers/GameActionController";
import { StringMap } from "../types";
import { Flower } from "../objects/Flower";

export function setupGameStateManager(
    gameStateController: GameStateController,
    gameDeltaController: GameDeltaController,
    guiController: GuiController,
    evolveSeedController: EvolveSeedController
) {
    const gameState$ = gameStateController.gameStateObservable();
    const gameDelta$ = gameDeltaController.gameDeltaObservable();
    const currentPlayerId$ = gameStateController.currentPlayerObservable();
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
        withLatestFrom(gameState$, stagedSeeds$, currentPlayerId$)
    ).subscribe(([newFlowerName, gameState, stagedSeed, currentPlayerId]) => {
        if (stagedSeed != null) {
            const result = calculateSeedEvolve(stagedSeed, gameState, newFlowerName);
            evolveSeedController.setEvolveStatus(result.outcomeType);

            const seedsToDelete = [{
                type: stagedSeed.type,
                amount: SEED_INTERVALS[stagedSeed.stagedAmount]
            }];

            if (result.outcomeType != 'FAILURE' && result.newFlower != null) {
                gameStateController.setState(applyEvolveResult(gameState, seedsToDelete, result.newFlower, currentPlayerId));
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

function calculateFinalDelta(gameState: GameState, gameDelta: GameStateDelta): GameStateDelta {
    const finalDelta = gameDelta;
    let flowersToRemove: string[] = [];

    Object.keys(gameState.flowersMap).forEach((key) => {
        const flower = gameState.flowersMap[key]
        const flowerType = gameState.flowerTypes[flower.type];
        const tile = gameState.getTileAt(flower.x, flower.y)!;
        const isNourished = isRequirementsSatisfied(tile.soil, flowerType);
        if (!isNourished) {
            const {
                tenacity,
                turnsUntilGrown
            } = gameState.flowerTypes[gameState.flowersMap[key].type];
            const growthNeeded = turnsUntilGrown - gameState.flowersMap[key].growth;
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
        finalDelta.addDelta(["tiles", tile.index, "soil", "nitrogenContent"], returnedNutrients);
        finalDelta.addDelta(["tiles", tile.index, "soil", "potassiumContent"], returnedNutrients);
        finalDelta.addDelta(["tiles", tile.index, "soil", "phosphorousContent"], returnedNutrients);
    });
    
    flowersToRemove.forEach(key => {
        finalDelta.addDelta(["flowersMap", key], null, "DELTA_REMOVE")
    });

    const placedSeeds = gameDelta.getIntermediateDelta<StringMap<PlacedSeed[]>>("placedSeeds") || {};
    let newIndex = Math.max(...Object.keys(gameState.flowersMap).map(type => parseInt(type))) + 1;
    Object.keys(placedSeeds)
        .map(key => placedSeeds[key])
        .flat()
        .forEach((placedSeed) => {
        if (placedSeed.amount > 0) {
            const newFlower = {
                x: placedSeed.tileIndex % gameState.numTilesX,
                y: Math.floor(placedSeed.tileIndex / gameState.numTilesX),
                type: placedSeed.type,
                growth: 0
            } as Flower;
            finalDelta.addDelta(["flowersMap", newIndex], newFlower, "DELTA_REPLACE");
            newIndex++;
        }
    });
    return finalDelta;
}

function nextState(gameState: GameState, gameDelta: GameStateDelta) {
    const copiedData = getCopiedState(gameState);
    const finalDelta = calculateFinalDelta(gameState, gameDelta);

    Object.keys(copiedData.seedStatus).forEach(key => {
        const addedSeeds = Math.floor(copiedData.seedStatus[key].progress / 100);
        copiedData.seedStatus[key].quantity += addedSeeds;
        copiedData.seedStatus[key].progress %= 100
    })

    const newState = new GameState(applyDeltas(copiedData, finalDelta));
    newState.generateNextCloudLayout();
    return newState;
}

function applyDeltas(gameData: GameStateData, deltas: GameStateDelta): GameStateData {
    deltas.getDeltas().forEach(delta => {
        const currentEntry = delta.keys.slice(0, delta.keys.length - 1).reduce((currentEntry, key) => {
            return currentEntry[key];
        }, gameData);
        const lastKey = delta.keys[delta.keys.length - 1];

        if (delta.deltaType == "DELTA_ADD") {
            if (!(lastKey in currentEntry)) {
                throw Error(`Tried to apply DELTA_ADD to non existent key ${delta.keys} for ${currentEntry}`);
            }
            currentEntry[lastKey] += delta.deltaValue as number;
        } else if (delta.deltaType == "DELTA_REMOVE") {
            delete currentEntry[lastKey];
        } else if (delta.deltaType == "DELTA_REPLACE") {
            currentEntry[lastKey] = delta.deltaValue;
        }
    });
    return gameData;
}

function applyEvolveResult(gameState: GameState, seeds: Array<{type: string, amount: number}>, newFlower: FlowerType, currentPlayerId: string) {
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
    copiedData.players[currentPlayerId].seedsOwned.push(newFlower.type);
    return new GameState(copiedData);
}

function deleteSeeds(gameState: GameState, seeds: Array<{type: string, amount: number}>) {
    seeds.forEach((seed) => {
        gameState.seedStatus[seed.type].quantity -= seed.amount;
    });
    return gameState;
}
