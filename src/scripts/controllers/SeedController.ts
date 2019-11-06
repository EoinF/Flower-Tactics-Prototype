import { GameStateManager } from "../GameStateManager";

export class SeedController {
    gameStateManager: GameStateManager
    constructor(gameStateManager: GameStateManager) {
        this.gameStateManager = gameStateManager;
    }
}