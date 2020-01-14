import { GameState } from "../objects/GameState";
import { GameStateDelta } from "../objects/GameStateDelta";
import { CLOUD_GRID_WIDTH } from "../constants";

export function calculateCloudDelta(gameState: GameState, gameDelta: GameStateDelta, placedCloudTileIndex: number | null) {
    let rainFallTiles: number[] = [];

    if (placedCloudTileIndex != null) {
        const cloudLayout = gameState.getCloudLayout();
        rainFallTiles = cloudLayout.map((isPlaced, index) => {
            if (isPlaced) {
                const x = Math.floor(index / CLOUD_GRID_WIDTH)
                const y = index % CLOUD_GRID_WIDTH;
                return placedCloudTileIndex + x + (y * gameState.numTilesX);
            } else {
                return null;
            }
        })
        .filter(tileIndex => tileIndex != null)
        .map(tileIndex => tileIndex!);
    }

    gameState.tiles.forEach((_, tileIndex) => {
        let waterDelta: number;
        if (rainFallTiles.indexOf(tileIndex) !== -1) {
            waterDelta = +3; // Rainfall adds 3 turns of water content to a tile
        } else if (gameState.tiles[tileIndex].waterContent > 0) {
            waterDelta = -1; // Water content degrades by 1 per turn
        } else {
            waterDelta = 0;
        }
        gameDelta.addDelta(["tiles", tileIndex, "waterContent"], waterDelta)
    });
}