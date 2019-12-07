import { GameState, GameStateData } from "../objects/GameState";
import { StringMap } from "../types";
import { Observable, ReplaySubject } from "rxjs";
import { calculateRiverEffects } from "../deltaCalculators/calculateRiverDelta";
import { calculateFlowerEffects } from "../deltaCalculators/calculateFlowerDelta";

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
    flowerDelta: Array<FlowerDelta>;
    seedStatusDelta: StringMap<SeedStatusDelta>;
    placedSeeds: StringMap<Map<number, number>>;
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
        
        this.gameStateDelta = this.getBlankDelta();
        this.nextState$.next(this.gameState);
        this.loadMap$.next(this.gameState);
        this.calculateDelta();
    }

    private generatePlacedSeedsMap() {
        const placedSeeds: StringMap<Map<number, number>> = {};
        
        Object.keys(this.gameState.flowerTypes).forEach(type => {
            placedSeeds[type] = new Map<number, number>();
        })
        return placedSeeds;
    }

    private getBlankSeedStatusDelta(): StringMap<SeedStatusDelta> {
        const seedStatusDelta = {};
        Object.keys(this.gameState.seedStatus).forEach(
            key => {
                seedStatusDelta[key] = {type: key, quantity: 0, progress: 0};
            });
        return seedStatusDelta;
    }

    private getBlankDelta(): GameStateDelta {
        return {
            flowerDelta: this.gameState.flowers.map(_ => ({amount: 0})),
            tileSoilDelta: this.gameState.tiles.map((_, index, array) => ({
                    nitrogen: 0,
                    potassium: 0,
                    phosphorous: 0
                })
            ),
            seedStatusDelta: this.getBlankSeedStatusDelta(),
            placedSeeds: this.generatePlacedSeedsMap()
        };
    }

    private calculateDelta() {
        this.gameStateDelta = this.getBlankDelta();
        calculateRiverEffects(this.gameState, this.gameStateDelta);
        calculateFlowerEffects(this.gameState, this.gameStateDelta);
        this.nextDelta$.next(this.gameStateDelta);
    }

    nextState() {
        const copiedData = JSON.parse(JSON.stringify(this.gameState)) as GameStateData;

        const {
            tileSoilDelta,
            flowerDelta,
            seedStatusDelta,
            placedSeeds
        } = this.gameStateDelta;

        tileSoilDelta.forEach((soilDelta, index) => {
            copiedData.tiles[index].soil.nitrogenContent += soilDelta.nitrogen;
            copiedData.tiles[index].soil.phosphorousContent += soilDelta.phosphorous;
            copiedData.tiles[index].soil.potassiumContent += soilDelta.potassium;
        });

        copiedData.flowers.forEach((copiedFlower, flowerIndex) => {
            const { amount } = flowerDelta[flowerIndex];
            copiedFlower.amount += amount;
        });

        
        Object.keys(placedSeeds).forEach(type => {
            placedSeeds[type].forEach((seedAmount, tileIndex) => {
                if (seedAmount > 0) {
                    copiedData.flowers.push({
                        index: tileIndex,
                        x: tileIndex % this.gameState.numTilesX,
                        y: Math.floor(tileIndex / this.gameState.numTilesX),
                        type,
                        amount: 0,
                        mode: 'Grow'
                    })
                }
            })
        });

        Object.keys(seedStatusDelta).forEach((type) => {
            const seedDelta = seedStatusDelta[type];
            const copiedSeedStatus = copiedData.seedStatus[type];
            copiedSeedStatus.progress += seedDelta.progress;
            copiedSeedStatus.quantity += seedDelta.quantity + Math.floor(copiedSeedStatus.progress / 100);
            copiedSeedStatus.progress %= 100;
        });

        this.gameState = new GameState(copiedData);
        this.calculateDelta();
        this.nextState$.next(this.gameState);
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

    moveSeed(type: string, previousTileIndex: number, nextTileIndex: number) {
        this._removeSeed(type, previousTileIndex);
        this._addSeed(type, nextTileIndex);
        this.nextDelta$.next(this.gameStateDelta);
    }

    placeSeed(type: string, tileIndex: number) {
        this.gameStateDelta.seedStatusDelta[type].quantity--;
        this._addSeed(type, tileIndex);
        this.nextDelta$.next(this.gameStateDelta);
    }

    removeSeed(type: string, tileIndex: number) {
        this.gameStateDelta.seedStatusDelta[type].quantity++;
        this._removeSeed(type, tileIndex);
        this.nextDelta$.next(this.gameStateDelta);
    }

    _addSeed(type: string, tileIndex: number) {
        let existingAmount = 0;
        if (this.gameStateDelta.placedSeeds[type].has(tileIndex)) {
            existingAmount = this.gameStateDelta.placedSeeds[type].get(tileIndex)!;
        }
        this.gameStateDelta.placedSeeds[type].set(tileIndex, existingAmount + 1);
    }
    _removeSeed(type: string, tileIndex: number) {
        this.gameStateDelta.placedSeeds[type].set(tileIndex, this.gameStateDelta.placedSeeds[type].get(tileIndex)! -1);
    }
}
