import { GameState } from "../objects/GameState";
import { GameStateDelta, SoilDelta } from "../controllers/GameStateManager";
import { Tile } from "../objects/Tile";

export function calculateRiverEffects(gameState: GameState, gameStateDelta: GameStateDelta) {
    gameState.rivers.forEach(river => {
        const centreTile = gameState.getTileAt(river.x, river.y)!;
        const soilDelta = getRiverEffect(centreTile, 1);
            
        gameStateDelta.tileSoilDelta[centreTile.index].nitrogen += soilDelta.nitrogen;
        gameStateDelta.tileSoilDelta[centreTile.index].phosphorous += soilDelta.phosphorous;
        gameStateDelta.tileSoilDelta[centreTile.index].potassium += soilDelta.potassium;

        gameState.getTilesAdjacent(river.x, river.y)
            .forEach(tile => {
                const soilDelta = getRiverEffect(tile, 0.5);
                        
                gameStateDelta.tileSoilDelta[tile.index].nitrogen += soilDelta.nitrogen;
                gameStateDelta.tileSoilDelta[tile.index].phosphorous += soilDelta.phosphorous;
                gameStateDelta.tileSoilDelta[tile.index].potassium += soilDelta.potassium;
            });
    });
}

function getRiverEffect(tile: Tile, amount: number): SoilDelta {
    return {
        nitrogen: 2 * amount,
        potassium: 2 * amount,
        phosphorous: 2 * amount
    };
}