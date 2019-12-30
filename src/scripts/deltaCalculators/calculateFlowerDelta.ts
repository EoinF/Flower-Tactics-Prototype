import { Tile } from "../objects/Tile";
import { Flower } from "../objects/Flower";
import { StringMap } from "../types";
import { FlowerType } from "../objects/FlowerType";
import { SoilDelta, FlowerDelta, SeedStatusDelta, GameStateDelta } from "../controllers/GameStateManager";
import { GameState } from "../objects/GameState";
import { isRequirementsSatisfied } from "./helpers";

export function calculateFlowerEffects(gameState: GameState, gameStateDelta: GameStateDelta) {
    gameState.tileToFlowerMap.forEach((flower, tile) => {
        const deltas = getFlowerEffect(tile, flower, gameState.flowerTypes);
        gameStateDelta.tileSoilDelta[tile.index].nitrogen += deltas.soilDelta.nitrogen;
        gameStateDelta.tileSoilDelta[tile.index].phosphorous += deltas.soilDelta.phosphorous;
        gameStateDelta.tileSoilDelta[tile.index].potassium += deltas.soilDelta.potassium;

        deltas.flowerDeltaMap.forEach((flowerDelta, flowerIndex) => {
            const existingDelta = gameStateDelta.flowerDelta.get(flowerIndex)!;
            gameStateDelta.flowerDelta.set(flowerIndex, {
                growth: existingDelta.growth + flowerDelta.growth,
                isNourished: flowerDelta.isNourished
            });
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
        seedProductionRate
    } = flowerTypes[flower.type];
    
    const flowerDeltaMap = new Map<number, FlowerDelta>();
    const seedDelta = new Map<string, SeedStatusDelta>();
    
    const isNourished = isRequirementsSatisfied(tile.soil, flowerTypes[flower.type])
    if (isNourished) {
        let growth = 1;
        if (flower.growth >= turnsUntilGrown) {
            growth = 0;
            seedDelta.set(flower.type, {
                quantity: 0,
                progress: seedProductionRate,
                type: flower.type
            })
        }
        flowerDeltaMap.set(flower.index, { growth, isNourished });
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
