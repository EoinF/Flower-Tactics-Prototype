import { GameState, GameStateData } from "../objects/GameState";
import { getRiverEffect, getFlowerEffect } from "../calculateDeltas";
import { Flower } from "../objects/Flower";
import { StringMap } from "../types";
import { Observable, ReplaySubject } from "rxjs";

export interface FlowerDelta {
    amount: number;
}

export interface SoilDelta {
    nitrogen: number;
    phosphorous: number;
    potassium: number;
}

export interface SeedStatusDelta {
    type: string;
    quantity: number;
    progress: number;
}

export interface GameStateDelta {
    tileSoilDelta: Array<SoilDelta>;
    flowerDelta: Map<Flower, FlowerDelta>;
    seedStatusDelta: StringMap<SeedStatusDelta>;
    placedSeeds: StringMap<Array<number>>;
}

export class GameStateManager {
    private seed: number;
    private gameState: GameState;
    private gameStateDelta: GameStateDelta;
    private loadMap$: ReplaySubject<GameState>;
    private nextState$: ReplaySubject<GameState>;
    private nextDelta$: ReplaySubject<GameStateDelta>;
    constructor(seed: number) {
        this.seed = seed;
        this.loadMap$ = new ReplaySubject(1);
        this.nextState$ = new ReplaySubject(1);
        this.nextDelta$ = new ReplaySubject(1);
    }

    setState(gameStateOrData: GameState | GameStateData) {
        if (gameStateOrData instanceof GameState) {
            this.gameState = gameStateOrData;
        } else {
            this.gameState = new GameState(gameStateOrData);
        }
        
        const totalTiles = this.gameState.tiles.length;
        this.gameStateDelta = {
            tileSoilDelta: new Array<SoilDelta | undefined>(totalTiles)
                .fill(undefined)
                .map(() => ({
                    nitrogen: 0,
                    potassium: 0,
                    phosphorous: 0
                })),
            flowerDelta: new Map<Flower, FlowerDelta>(),
            seedStatusDelta: {},
            placedSeeds: this.generatePlacedSeedsMap()
        };
        this.nextState$.next(this.gameState);
        this.loadMap$.next(this.gameState);
        this.calculateDelta();
    }

    private generatePlacedSeedsMap() {
        const placedSeeds: StringMap<Array<number>> = {};
        
        Object.keys(this.gameState.flowerTypes).forEach(type => {
            placedSeeds[type] = [];
        })
        return placedSeeds;
    }

    private calculateDelta() {
        this.gameStateDelta.flowerDelta.clear();
        this.gameStateDelta.tileSoilDelta.forEach((_, index, array) => {
            array[index] = {
                nitrogen: 0,
                potassium: 0,
                phosphorous: 0
            };
        });
        this.gameStateDelta.seedStatusDelta = {};
        this.gameStateDelta.placedSeeds = this.generatePlacedSeedsMap();
        this.calculateRiverEffects(this.gameStateDelta);
        this.calculateFlowerEffects(this.gameStateDelta);
        this.nextDelta$.next(this.gameStateDelta);
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
        Object.keys(this.gameStateDelta.seedStatusDelta).forEach((type) => {
            const seedDelta = this.gameStateDelta.seedStatusDelta[type];
            const copiedSeedStatus = copiedData.seedStatus[type];
            if (copiedSeedStatus != null) {
                copiedSeedStatus.progress += seedDelta.progress;
                copiedSeedStatus.quantity += seedDelta.quantity + Math.floor(copiedSeedStatus.progress / 100);
                copiedSeedStatus.progress %= 100;
            }
        });

        this.gameState = new GameState(copiedData);
        this.calculateDelta();
        this.nextState$.next(this.gameState);
    }

    private calculateRiverEffects(gameStateDelta: GameStateDelta) {
        this.gameState.rivers.forEach(river => {
            const centreTile = this.gameState.getTileAt(river.x, river.y)!;
            const soilDelta = getRiverEffect(centreTile, 1);
                
            gameStateDelta.tileSoilDelta[centreTile.index].nitrogen += soilDelta.nitrogen;
            gameStateDelta.tileSoilDelta[centreTile.index].phosphorous += soilDelta.phosphorous;
            gameStateDelta.tileSoilDelta[centreTile.index].potassium += soilDelta.potassium;

            this.gameState.getTilesAdjacent(river.x, river.y)
                .forEach(tile => {
                    const soilDelta = getRiverEffect(tile, 0.5);
                            
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

            deltas.seedDelta.forEach((seedDelta, type) => {
                const existingEntry = gameStateDelta.seedStatusDelta[type];
                let newDelta: SeedStatusDelta;
                if (existingEntry != null) {
                    newDelta = {
                        quantity: existingEntry.quantity + seedDelta.quantity,
                        progress: existingEntry.progress + seedDelta.progress,
                        type: existingEntry.type
                    }
                } else {
                    newDelta = seedDelta;
                }
                gameStateDelta.seedStatusDelta[type] = newDelta;
            });
        });
    }

    nextStateObservable(): Observable<GameState> {
        return this.nextState$;
    }

    nextDeltaObservable(): Observable<GameStateDelta> {
        return this.nextDelta$;
    }

    loadMapObservable(): Observable<GameState> {
        return this.loadMap$;
    }

    placeSeed(type: string, tileIndex: number) {
        this.gameStateDelta.placedSeeds[type].push(tileIndex);
        this.nextDelta$.next(this.gameStateDelta);
    }
}
