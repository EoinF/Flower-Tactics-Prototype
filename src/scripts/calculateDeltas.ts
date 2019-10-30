import { Tile } from "./objects/Tile";
import { Flower } from "./objects/Flower";
import { StringMap } from "./types";
import { FlowerType } from "./objects/FlowerType";
import { SoilDelta, FlowerDelta } from "./GameStateManager";

export function getRiverEffect(tile: Tile, amount: number): SoilDelta {
    return {
        nitrogen: 0.002 * amount,
        potassium: 0.001 * amount,
        phosphorous: 0.001 * amount
    };
}

export function getFlowerEffect(tile: Tile, flowers: Flower[], flowerTypes: StringMap<FlowerType>): {soilDelta: SoilDelta, flowerDelta: Map<Flower, FlowerDelta>} {
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
    
    if (nitrogenRequirements.min <= tile.soil.nitrogenContent && tile.soil.nitrogenContent <= nitrogenRequirements.max
        && phosphorousRequirements.min <= tile.soil.phosphorousContent && tile.soil.phosphorousContent <= phosphorousRequirements.max
        && potassiumRequirements.min <= tile.soil.potassiumContent && tile.soil.potassiumContent <= potassiumRequirements.max) {
        
        console.log("delta: " + growthRate);
        flowerDelta.set(flower, {amount: growthRate * 0.6});
    }
    const soilDelta = {
        nitrogen: -0.01 * growthRate * flower.amount,
        potassium: -0.01 * growthRate * flower.amount,
        phosphorous: -0.01 * growthRate * flower.amount
    };

    return {
        soilDelta,
        flowerDelta
    }
}