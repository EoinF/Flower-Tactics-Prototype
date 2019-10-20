import { GameStateManager } from "../GameStateManager";

export class GuiController {
    gameStateManager: GameStateManager
    constructor(gameStateManager: GameStateManager) {
        this.gameStateManager = gameStateManager;
    }

    nextTurn() {
        this.gameStateManager.nextState();
    }
}