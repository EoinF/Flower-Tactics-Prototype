import { GameState } from "../objects/GameState";
import { GameStateDelta } from "../objects/GameStateDelta";
import { CLOUD_GRID_WIDTH } from "../constants";

export function calculateCloudDelta(gameState: GameState, gameDelta: GameStateDelta, placedCloudTileIndex: number | null) {
    let rainfallTiles: number[] = [];

    if (placedCloudTileIndex != null) {
        const cloudLayout = gameState.getCloudLayout();
        rainfallTiles = cloudLayout.map((isPlaced, index) => {
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

    gameDelta.addDelta(["rainfallTiles"], rainfallTiles, "DELTA_REPLACE");
}