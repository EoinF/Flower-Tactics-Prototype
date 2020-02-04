import { Tile } from "../objects/Tile";
import { Flower } from "../objects/Flower";
import { GameState } from "../objects/GameState";
import { isRequirementsSatisfied } from "./helpers";
import { GameStateDelta } from "../objects/GameStateDelta";

export function calculateFlowerDelta(gameState: GameState, gameStateDelta: GameStateDelta) {
    Object.keys(gameState.flowersMap).forEach((key) => {
        const flower = gameState.flowersMap[key];
        const tile = gameState.getTileAt(flower.x, flower.y)!;
        const bonusFromWater = 1 + gameState.getTileWaterContent(tile);
        
        getFlowerEffect(gameStateDelta, tile, flower, key, gameState, bonusFromWater);
    });
}

function getFlowerEffect(deltas: GameStateDelta, tile: Tile, flower: Flower, flowerKey: string, gameState: GameState, bonusMultiplier: number): GameStateDelta {
    const {
        turnsUntilGrown,
        seedProductionRate
    } = gameState.flowerTypes[flower.type];

    const {
        progress
    } = gameState.seedStatus[flower.type];

    
    if (flower.growth < turnsUntilGrown) {
        if (isRequirementsSatisfied(tile.soil, gameState.flowerTypes[flower.type])) {
            const growthDelta = Math.min(Math.floor(+1 * bonusMultiplier), turnsUntilGrown - flower.growth);
            deltas.addDelta(["flowersMap", flowerKey, "growth"], growthDelta);
        }
    } else {
        const savedDeltaProgress = deltas.getDelta(["seedStatus", flower.type, "progress"]);
        const previousDeltaProgress = (savedDeltaProgress ? savedDeltaProgress.deltaValue as number : 0);
        const additionalProgress = seedProductionRate * bonusMultiplier;
        const currentProgress = progress + previousDeltaProgress;
        const newProgress = currentProgress + additionalProgress;
        const newDeltaQuantity = Math.floor(newProgress / 100);
        const newDeltaProgress = (newProgress % 100) - progress;

        deltas.addDelta(["seedStatus", flower.type, "progress"], newDeltaProgress - previousDeltaProgress);
        deltas.addDelta(["seedStatus", flower.type, "quantity"], newDeltaQuantity);
        deltas.addDelta(["flowersMap", flowerKey, "growth"], +1);
    }

    return deltas;
}
