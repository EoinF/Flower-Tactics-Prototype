import { GameState } from "../objects/GameState";
import { GameStateDelta } from "../objects/GameStateDelta";

export function calculateBaseSoilDelta(state: GameState, delta: GameStateDelta) {
    state.tiles.forEach((tile) => {
        if (tile.waterContent <= 0 || tile.waterContent > 9) {
            const degradationAmount = -25;
            delta.addDelta(["tiles", tile.index, "soil", "nitrogenContent"], degradationAmount);
            delta.addDelta(["tiles", tile.index, "soil", "potassiumContent"], degradationAmount);
            delta.addDelta(["tiles", tile.index, "soil", "phosphorousContent"], degradationAmount);
        }
    });
}