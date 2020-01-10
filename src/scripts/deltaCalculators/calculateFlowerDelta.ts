import { Tile } from "../objects/Tile";
import { Flower } from "../objects/Flower";
import { StringMap } from "../types";
import { FlowerType } from "../objects/FlowerType";
import { GameState } from "../objects/GameState";
import { isRequirementsSatisfied } from "./helpers";
import { GameStateDelta } from "../objects/GameStateDelta";

export function calculateFlowerEffects(gameState: GameState, gameStateDelta: GameStateDelta) {
    Object.keys(gameState.flowersMap).forEach((key) => {
        const flower = gameState.flowersMap[key];
        const tile = gameState.getTileAt(flower.x, flower.y)!;
        
        const deltas = getFlowerEffect(tile, flower, key, gameState.flowerTypes);
        gameStateDelta.combineDeltas(deltas);
    });
}

export function getFlowerEffect(tile: Tile, flower: Flower, flowerKey: string, flowerTypes: StringMap<FlowerType>): GameStateDelta {
    const {
        turnsUntilGrown,
        soilConsumptionRate,
        seedProductionRate
    } = flowerTypes[flower.type];
    
    const deltas = new GameStateDelta();
    
    if (flower.growth < turnsUntilGrown) {
        if (isRequirementsSatisfied(tile.soil, flowerTypes[flower.type])) {
            deltas.addDelta(["flowersMap", flowerKey, "growth"], +1)
        }
    } else {
        deltas.addDelta(["seedStatus", flower.type, "progress"], seedProductionRate);
    }

    deltas.addDelta(["tiles", tile.index, "soil", "nitrogenContent"], -soilConsumptionRate);
    deltas.addDelta(["tiles", tile.index, "soil", "potassiumContent"], -soilConsumptionRate);
    deltas.addDelta(["tiles", tile.index, "soil", "phosphorousContent"], -soilConsumptionRate);

    return deltas;
}
