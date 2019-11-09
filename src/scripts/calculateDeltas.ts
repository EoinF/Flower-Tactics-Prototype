import { Tile } from "./objects/Tile";
import { Flower } from "./objects/Flower";
import { StringMap } from "./types";
import { FlowerType } from "./objects/FlowerType";
import { SoilDelta, FlowerDelta, SeedStatusDelta } from "./controllers/GameStateManager";

export function getRiverEffect(tile: Tile, amount: number): SoilDelta {
    return {
        nitrogen: 0.02 * amount,
        potassium: 0.02 * amount,
        phosphorous: 0.02 * amount
    };
}

export function getFlowerEffect(tile: Tile, flowers: Flower[], flowerTypes: StringMap<FlowerType>): {soilDelta: SoilDelta, flowerDelta: Map<Flower, FlowerDelta>, seedDelta: Map<string, SeedStatusDelta>} {
    const flower = {
        ...flowers[0]
    };
    const {
        growthRate,
        nitrogenRequirements,
        phosphorousRequirements,
        potassiumRequirements
    } = flowerTypes[flower.type];
    
    const flowerDelta = new Map<Flower, FlowerDelta>();
    const seedDelta = new Map<string, SeedStatusDelta>();
    
    if (nitrogenRequirements.min <= tile.soil.nitrogenContent && tile.soil.nitrogenContent <= nitrogenRequirements.max
        && phosphorousRequirements.min <= tile.soil.phosphorousContent && tile.soil.phosphorousContent <= phosphorousRequirements.max
        && potassiumRequirements.min <= tile.soil.potassiumContent && tile.soil.potassiumContent <= potassiumRequirements.max) {
        
        if (flower.mode == "Grow") {
            flowerDelta.set(flower, {amount: growthRate});
        } else {
            seedDelta.set(flower.type, {
                quantity: 0,
                progress: Math.floor(growthRate * flower.amount * 0.1),
                type: flower.type
            })
        }
    }
    const soilDelta = {
        nitrogen: -0.0002 * growthRate * flower.amount,
        potassium: -0.0002 * growthRate * flower.amount,
        phosphorous: -0.0002 * growthRate * flower.amount
    };

    return {
        soilDelta,
        flowerDelta,
        seedDelta
    }
}