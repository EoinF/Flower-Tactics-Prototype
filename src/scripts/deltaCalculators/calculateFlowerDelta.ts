import { Tile } from "../objects/Tile";
import { Flower } from "../objects/Flower";
import { StringMap } from "../types";
import { FlowerType } from "../objects/FlowerType";
import { SoilDelta, FlowerDelta, SeedStatusDelta, GameStateDelta } from "../controllers/GameStateManager";
import { GameState } from "../objects/GameState";

export function calculateFlowerEffects(gameState: GameState, gameStateDelta: GameStateDelta) {
    gameState.tileToFlowerMap.forEach((flower, tile) => {
        const deltas = getFlowerEffect(tile, flower, gameState.flowerTypes);
        gameStateDelta.tileSoilDelta[tile.index].nitrogen += deltas.soilDelta.nitrogen;
        gameStateDelta.tileSoilDelta[tile.index].phosphorous += deltas.soilDelta.phosphorous;
        gameStateDelta.tileSoilDelta[tile.index].potassium += deltas.soilDelta.potassium;

        deltas.flowerDeltaMap.forEach((flowerDelta, flowerIndex) => {
            const existingDelta = gameStateDelta.flowerDelta[flowerIndex];
            gameStateDelta.flowerDelta[flowerIndex] = {
                growth: existingDelta.growth + flowerDelta.growth
            };
        });

        deltas.seedDelta.forEach((seedDelta, type) => {
            const existingEntry = gameStateDelta.seedStatusDelta[type];
            gameStateDelta.seedStatusDelta[type] = {
                quantity: existingEntry.quantity + seedDelta.quantity,
                progress: existingEntry.progress + seedDelta.progress,
                type: existingEntry.type
            };
        });
    });
}

export function getFlowerEffect(tile: Tile, flower: Flower, flowerTypes: StringMap<FlowerType>): {soilDelta: SoilDelta, flowerDeltaMap: Map<number, FlowerDelta>, seedDelta: Map<string, SeedStatusDelta>} {
    const {
        turnsUntilGrown,
        soilConsumptionRate,
        seedProductionRate,
        nitrogenRequirements,
        phosphorousRequirements,
        potassiumRequirements
    } = flowerTypes[flower.type];
    
    const flowerDeltaMap = new Map<number, FlowerDelta>();
    const seedDelta = new Map<string, SeedStatusDelta>();
    
    if (nitrogenRequirements.min <= tile.soil.nitrogenContent && tile.soil.nitrogenContent <= nitrogenRequirements.max
        && phosphorousRequirements.min <= tile.soil.phosphorousContent && tile.soil.phosphorousContent <= phosphorousRequirements.max
        && potassiumRequirements.min <= tile.soil.potassiumContent && tile.soil.potassiumContent <= potassiumRequirements.max) {
        
        if (flower.growth < turnsUntilGrown) {
            flowerDeltaMap.set(flower.index, { growth: 1 });
        } else {
            seedDelta.set(flower.type, {
                quantity: 0,
                progress: seedProductionRate,
                type: flower.type
            })
        }
    }

    const totalDelta = soilConsumptionRate;
    const soilDelta = {
        nitrogen: -totalDelta,
        potassium: -totalDelta,
        phosphorous: -totalDelta
    };

    return {
        soilDelta,
        flowerDeltaMap,
        seedDelta
    }
}
