import { Tile } from "../objects/Tile";
import { Flower } from "../objects/Flower";
import { StringMap } from "../types";
import { FlowerType } from "../objects/FlowerType";
import { GameState } from "../objects/GameState";
import { isRequirementsSatisfied } from "./helpers";
import { GameStateDelta } from "../objects/GameStateDelta";

export function calculateFlowerDelta(gameState: GameState, gameStateDelta: GameStateDelta) {
    Object.keys(gameState.flowersMap).forEach((key) => {
        const flower = gameState.flowersMap[key];
        const tile = gameState.getTileAt(flower.x, flower.y)!;
        const bonusFromWater = 1 + gameState.getTileWaterContent(tile);
        
        const deltas = getFlowerEffect(tile, flower, key, gameState.flowerTypes, bonusFromWater);
        gameStateDelta.combineDeltas(deltas);
    });
}

function getFlowerEffect(tile: Tile, flower: Flower, flowerKey: string, flowerTypes: StringMap<FlowerType>, bonusMultiplier: number): GameStateDelta {
    const {
        turnsUntilGrown,
        seedProductionRate
    } = flowerTypes[flower.type];
    
    const deltas = new GameStateDelta();
    
    if (flower.growth < turnsUntilGrown) {
        if (isRequirementsSatisfied(tile.soil, flowerTypes[flower.type])) {
            const growthDelta = Math.min(Math.floor(+1 * bonusMultiplier), turnsUntilGrown - flower.growth);
            deltas.addDelta(["flowersMap", flowerKey, "growth"], growthDelta);
        }
    } else {
        deltas.addDelta(["seedStatus", flower.type, "progress"], Math.floor(seedProductionRate * bonusMultiplier));
    }

    return deltas;
}
