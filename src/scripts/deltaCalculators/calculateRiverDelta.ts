import { GameState } from "../objects/GameState";
import { Tile } from "../objects/Tile";
import { GameStateDelta } from "../objects/GameStateDelta";

export function calculateRiverEffects(gameState: GameState, gameStateDelta: GameStateDelta) {
    gameState.rivers.forEach(river => {
        const centreTile = gameState.getTileAt(river.x, river.y)!;
        getRiverEffect(gameStateDelta, centreTile, 1);

        gameState.getTilesAdjacent(river.x, river.y)
            .forEach(tile => {
                getRiverEffect(gameStateDelta, tile, 0.5);
            });
    });
}

function getRiverEffect(delta: GameStateDelta, tile: Tile, amount: number) {
    delta.addDelta(["tiles", tile.index, "soil", "nitrogenContent"], 2 * amount);
    delta.addDelta(["tiles", tile.index, "soil", "phosphorousContent"], 2 * amount);
    delta.addDelta(["tiles", tile.index, "soil", "potassiumContent"], 2 * amount);
}