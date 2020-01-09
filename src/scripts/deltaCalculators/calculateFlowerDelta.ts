import { Tile } from "../objects/Tile";
import { Flower } from "../objects/Flower";
import { StringMap } from "../types";
import { FlowerType } from "../objects/FlowerType";
import { GameState } from "../objects/GameState";
import { isRequirementsSatisfied } from "./helpers";
import { GameStateDelta, SoilDelta, FlowerDelta, SeedStatusDelta } from "../connectors/gameDeltaConnectors";

export function calculateFlowerEffects(gameState: GameState, gameStateDelta: GameStateDelta) {
    Object.keys(gameState.flowersMap).forEach((key) => {
        const flower = gameState.flowersMap[key];
        const tile = gameState.getTileAt(flower.x, flower.y)!;
        const deltas = getFlowerEffect(tile, flower, key, gameState.flowerTypes);
        gameStateDelta.tileSoilDelta[tile.index].nitrogen += deltas.soilDelta.nitrogen;
        gameStateDelta.tileSoilDelta[tile.index].phosphorous += deltas.soilDelta.phosphorous;
        gameStateDelta.tileSoilDelta[tile.index].potassium += deltas.soilDelta.potassium;

        Object.keys(deltas.flowerDeltaMap).forEach((flowerIndex) => {
            const flowerDelta = deltas.flowerDeltaMap[flowerIndex];
            const existingDelta = gameStateDelta.flowerDelta[flowerIndex]!;
            gameStateDelta.flowerDelta[flowerIndex] = {
                growth: existingDelta.growth + flowerDelta.growth,
                isNourished: flowerDelta.isNourished
            };
        });

        Object.keys(deltas.seedDelta).forEach((type) => {
            const seedDelta = deltas.seedDelta[type];
            const existingEntry = gameStateDelta.seedStatusDelta[type];
            gameStateDelta.seedStatusDelta[type] = {
                quantity: existingEntry.quantity + seedDelta.quantity,
                progress: existingEntry.progress + seedDelta.progress,
                type: existingEntry.type
            };
        });
    });
}

export function getFlowerEffect(tile: Tile, flower: Flower, flowerKey: string, flowerTypes: StringMap<FlowerType>): {soilDelta: SoilDelta, flowerDeltaMap: StringMap<FlowerDelta>, seedDelta: StringMap<SeedStatusDelta>} {
    const {
        turnsUntilGrown,
        soilConsumptionRate,
        seedProductionRate
    } = flowerTypes[flower.type];
    
    const flowerDeltaMap: StringMap<FlowerDelta> = {};
    const seedDelta: StringMap<SeedStatusDelta> = {};
    
    const isNourished = isRequirementsSatisfied(tile.soil, flowerTypes[flower.type]);
    let growth: number;
    if (flower.growth < turnsUntilGrown) {
        if (isNourished) {
            growth = 1;
        } else {
            growth = 0;
        }
    } else {
        growth = 0;
        seedDelta[flower.type] = {
            quantity: 0,
            progress: seedProductionRate,
            type: flower.type
        };
    }
    
    flowerDeltaMap[flowerKey] = { growth, isNourished };

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
