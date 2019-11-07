import { GameStateManager } from "../GameStateManager";

export class MapController {
    gameStateManager: GameStateManager;
    savedDragSeedOverTileIndex: number | null;
    dragSeedOverTileCallbacks: Array<(newIndex: number | null, oldIndex: number | null) => void>;

    constructor(gameStateManager: GameStateManager) {
        this.dragSeedOverTileCallbacks = [];
        this.gameStateManager = gameStateManager;
    }

    dragSeedOverTile(newIndex: number | null) {
        this.dragSeedOverTileCallbacks.forEach(f => f(newIndex, this.savedDragSeedOverTileIndex));
        this.savedDragSeedOverTileIndex = newIndex;
    }

    onDragSeedOverTile(callback: (newIndex: number | null, oldIndex: number | null) => void) {
        this.dragSeedOverTileCallbacks.push(callback);
    }

    placeSeed(type: string, tileX: number, tileY: number) {
        if (this.gameStateManager.gameState.getTileAt(tileX, tileY) != null) {
            this.gameStateManager.placeSeed(type, tileX, tileY);
        }
        this.dragSeedOverTile(null);
    }
}