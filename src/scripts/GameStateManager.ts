import { GameState, GameStateData } from "./GameState";
import { applyRiverEffect } from "./applyEffectToTile";
import { River } from "./objects/River";

export class GameStateManager {
    private seed: number;
    gameState: GameState;
    private callbacks: Function[];
    constructor(seed: number) {
        this.seed = seed;
        this.callbacks = [];
    }

    setState(gameStateOrData: GameState | GameStateData) {
        if (gameStateOrData instanceof GameState) {
            this.gameState = gameStateOrData;
        } else {
            this.gameState = new GameState(gameStateOrData)
        }
    }

    nextState() {
        const copiedData = JSON.parse(JSON.stringify(this.gameState)) as GameStateData;
        const copiedState = new GameState(copiedData);

        this.gameState.rivers.forEach(river => this.applyRiverEffect(river, copiedState));

        this.gameState = copiedState;
        this.callbacks.forEach(callback => callback(this.gameState));
    }

    applyRiverEffect(river: River, copiedState: GameState) {
        const centreTile = copiedState.getTileAt(river.x, river.y);

        copiedState.updateTile(applyRiverEffect(centreTile, 1));

        copiedState.getTilesAdjacent(river.x, river.y)
            .map(tile => applyRiverEffect(tile, 0.5))
            .forEach(tile => copiedState.updateTile(tile));
    }

    onChange(callback: (gameState: GameState) => void) {
        this.callbacks.push(callback);
    }
}
