import { GameState } from "../objects/GameState";
import { GameDeltaController } from "../controllers/GameDeltaController";
import { GameStateController } from "../controllers/GameStateController";
import { calculateRiverEffects } from "../deltaCalculators/calculateRiverDelta";
import { calculateFlowerEffects } from "../deltaCalculators/calculateFlowerDelta";
import { GameStateDelta } from "../objects/GameStateDelta";
import { CLOUD_GRID_WIDTH } from "../constants";
import { GameActionController, PlacedSeedsMap, PlacedSeed } from "../controllers/GameActionController";
import { combineLatest } from "rxjs";
import { StringMap } from "../types";

export function setupGameDeltaManager(
    gameStateController: GameStateController,
    gameDeltaController: GameDeltaController,
    gameActionController: GameActionController
) {
    combineLatest(gameStateController.gameStateObservable(), gameActionController.placedSeedsMapObservable(), gameActionController.placedCloudsObservable())
        .subscribe(([gameState, placedSeedsMap, placedCloudTileIndex]) => {
            gameDeltaController.setDelta(calculateDelta(gameState, placedSeedsMap, placedCloudTileIndex));
        });
}

function getBlankSeedStatusDelta(gameState: GameState): GameStateDelta {
    const seedStatusDelta = new GameStateDelta();
    Object.keys(gameState.seedStatus).forEach(
        key => {
            seedStatusDelta[key] = {type: key, quantity: 0, progress: 0};
        });
    return seedStatusDelta;
}

function getBlankDelta(gameState: GameState): GameStateDelta {
    const tileSoilDelta = generateSoilDeltaMap(gameState);
    const seedStatusDelta = getBlankSeedStatusDelta(gameState);
    return tileSoilDelta
        .combineDeltas(seedStatusDelta);
}

function generateSoilDeltaMap(gameState: GameState): GameStateDelta {
    const soilDeltas = new GameStateDelta();
    gameState.tiles.forEach((tile) => {
        if (tile.waterContent <= 0 || tile.waterContent > 9) {
            const degredationAmount = -25;
            soilDeltas.addDelta(["tiles", tile.index, "soil", "nitrogenContent"], degredationAmount);
            soilDeltas.addDelta(["tiles", tile.index, "soil", "potassiumContent"], degredationAmount);
            soilDeltas.addDelta(["tiles", tile.index, "soil", "phosphorousContent"], degredationAmount);
        }
    });
    return soilDeltas;
}

function calculateCloudEffects(gameState: GameState, gameDelta: GameStateDelta, placedCloudTileIndex: number | null) {
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

    gameState.tiles.forEach((_, tileIndex) => {
        let waterDelta: number;
        if (rainFallTiles.indexOf(tileIndex) !== -1) {
            waterDelta = +3; // Rainfall adds 3 turns of water content to a tile
        } else if (gameState.tiles[tileIndex].waterContent > 0) {
            waterDelta = -1; // Water content degrades by 1 per turn
        } else {
            waterDelta = 0;
        }
        gameDelta.addDelta(["tiles", tileIndex, "waterContent"], waterDelta)
    });
}

function calculateSeedPlacementEffects(state: GameState, delta: GameStateDelta, placedSeeds: PlacedSeedsMap) {
    placedSeeds.forEach((placedSeed) => {
        delta.addDelta(["seedStatus", placedSeed.type, "quantity"], - placedSeed.amount);
        delta.addIntermediateDelta<StringMap<PlacedSeed[]>>("placedSeeds", existingValue => {
            if (existingValue == null) {
                return {
                    [placedSeed.type]: [{
                        ...placedSeed,
                        amount: placedSeed.amount 
                    }]
                }
            } else {
                return {
                    ...existingValue,
                    [placedSeed.type]: [
                        ...existingValue[placedSeed.type],
                        {
                            ...placedSeed, 
                            amount: placedSeed.amount
                        }
                    ]
                }
            }
        });
    });
}

function calculateDelta(state: GameState, placedSeeds: PlacedSeedsMap, placedCloudTileIndex: number | null) {
    const delta = getBlankDelta(state);
    calculateRiverEffects(state, delta);
    calculateFlowerEffects(state, delta);
    calculateCloudEffects(state, delta, placedCloudTileIndex);
    calculateSeedPlacementEffects(state, delta, placedSeeds);
    return delta;
}
