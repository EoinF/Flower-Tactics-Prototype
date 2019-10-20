import { GameState } from "./GameState";
import { Tile, Soil } from "./objects/Tile";

export class GameStateManager {
    private seed: number;
    gameState: GameState;
    private callbacks: Function[];
    constructor(seed: number) {
        this.seed = seed;
        this.callbacks = [];
    }

    setState(gameState: GameState) {
        this.gameState = gameState;
    }

    nextState() {
        const copiedState = JSON.parse(JSON.stringify(this.gameState)) as GameState;

        this.gameState.rivers.forEach(river => {
            const tileIndex = river.x + river.y * this.gameState.numTilesX;
            const tile = copiedState.tiles[tileIndex];
            tile.soil.nitrogenContent += 0.001;
            tile.soil.phosphorousContent += 0.001;
            tile.soil.potassiumContent += 0.001;
        });

        this.gameState = copiedState;
        
        this.callbacks.forEach(callback => callback(this.gameState));
    }

    onChange(callback: (gameState: GameState) => void) {
        this.callbacks.push(callback);
    }
}
