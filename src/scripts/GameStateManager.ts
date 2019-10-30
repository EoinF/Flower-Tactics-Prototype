import { GameState, GameStateData } from "./GameState";
import { getRiverEffect, getFlowerEffect } from "./calculateDeltas";
import { Flower } from "./objects/Flower";

export interface FlowerDelta {
    amount: number;
}

export interface SoilDelta {
    nitrogen: number;
    phosphorous: number;
    potassium: number;
}

export interface GameStateDelta {
    tileSoilDelta: Array<SoilDelta>;
    flowerDelta: Map<Flower, FlowerDelta>;
}

export class GameStateManager {
    private seed: number;
    gameState: GameState;
    gameStateDelta: GameStateDelta;
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
        this.calculateDelta();
    }

    calculateDelta() {
        const totalTiles = this.gameState.tiles.length;
        this.gameStateDelta = {
            tileSoilDelta: new Array<SoilDelta | undefined>(totalTiles)
                .fill(undefined)
                .map(() => ({
                    nitrogen: 0,
                    potassium: 0,
                    phosphorous: 0
                })),
            flowerDelta: new Map<Flower, FlowerDelta>()
        };
        this.calculateRiverEffects(this.gameStateDelta);
        this.calculateFlowerEffects(this.gameStateDelta);
    }

    nextState() {
        const copiedData = JSON.parse(JSON.stringify(this.gameState)) as GameStateData;

        this.gameStateDelta.tileSoilDelta.forEach((soilDelta, index) => {
            copiedData.tiles[index].soil.nitrogenContent += soilDelta.nitrogen;
            copiedData.tiles[index].soil.phosphorousContent += soilDelta.phosphorous;
            copiedData.tiles[index].soil.potassiumContent += soilDelta.potassium;
        });

        this.gameStateDelta.flowerDelta.forEach((flowerDelta, flower) => {
            const copiedFlower = copiedData.flowers.find(f => flower.x == f.x && flower.y == f.y && flower.type == flower.type);
            if (copiedFlower != null) {
                copiedFlower.amount += flowerDelta.amount
            }
        });

        this.gameState = new GameState(copiedData);
        this.callbacks.forEach(callback => callback(this.gameState));
    }

    private calculateRiverEffects(gameStateDelta: GameStateDelta) {
        this.gameState.rivers.forEach(river => {
            const centreTile = this.gameState.getTileAt(river.x, river.y);
            const soilDelta = getRiverEffect(centreTile, 1);
                
            gameStateDelta.tileSoilDelta[centreTile.index].nitrogen += soilDelta.nitrogen;
            gameStateDelta.tileSoilDelta[centreTile.index].phosphorous += soilDelta.phosphorous;
            gameStateDelta.tileSoilDelta[centreTile.index].potassium += soilDelta.potassium;

            this.gameState.getTilesAdjacent(river.x, river.y)
                .forEach(tile => {
                    const soilDelta = getRiverEffect(tile, 0.5)
                            
                    gameStateDelta.tileSoilDelta[tile.index].nitrogen += soilDelta.nitrogen;
                    gameStateDelta.tileSoilDelta[tile.index].phosphorous += soilDelta.phosphorous;
                    gameStateDelta.tileSoilDelta[tile.index].potassium += soilDelta.potassium;
                });
        });
    }

    private calculateFlowerEffects(gameStateDelta: GameStateDelta) {
        this.gameState.tileToFlowerMap.forEach((flowers, tile) => {
            const deltas = getFlowerEffect(tile, flowers, this.gameState.flowerTypes);
            gameStateDelta.tileSoilDelta[tile.index].nitrogen += deltas.soilDelta.nitrogen;
            gameStateDelta.tileSoilDelta[tile.index].phosphorous += deltas.soilDelta.phosphorous;
            gameStateDelta.tileSoilDelta[tile.index].potassium += deltas.soilDelta.potassium;

            deltas.flowerDelta.forEach((flowerDelta, flower) => {
                const existingEntry = gameStateDelta.flowerDelta.get(flower);
                let newDelta: FlowerDelta;
                if (existingEntry != null) {
                    newDelta = {
                        amount: existingEntry.amount + flowerDelta.amount
                    }
                } else {
                    newDelta = flowerDelta;
                }
                gameStateDelta.flowerDelta.set(flower, newDelta);
            });
        });
    }

    onChange(callback: (gameState: GameState) => void) {
        this.callbacks.push(callback);
    }
}
