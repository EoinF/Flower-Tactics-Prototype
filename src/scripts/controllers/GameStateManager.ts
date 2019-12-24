import { GameState, GameStateData } from "../objects/GameState";
import { StringMap } from "../types";
import { Observable, ReplaySubject, BehaviorSubject } from "rxjs";
import { calculateRiverEffects } from "../deltaCalculators/calculateRiverDelta";
import { calculateFlowerEffects } from "../deltaCalculators/calculateFlowerDelta";
import { FlowerType } from "../objects/FlowerType";
import { map, filter } from "rxjs/operators";

export interface FlowerDelta {
    growth: number;
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
    private loadMap$: ReplaySubject<GameState>;
    private nextState$: BehaviorSubject<GameState | null>;
    private nextDelta$: BehaviorSubject<GameStateDelta | null>;
    constructor(seed: number) {
        this.seed = seed;
        this.loadMap$ = new ReplaySubject(1);
        this.nextState$ = new BehaviorSubject<GameState | null>(null);
        this.nextDelta$ = new BehaviorSubject<GameStateDelta | null>(null);
    }

    setState(gameStateOrData: GameState | GameStateData) {
        let gameState: GameState;
        if (gameStateOrData instanceof GameState) {
            gameState = gameStateOrData;
        } else {
            gameState = new GameState(gameStateOrData);
        }
        
        this.nextState$.next(gameState);
        this.loadMap$.next(gameState);
        this.nextDelta$.next(this.calculateDelta());
    }

    private generatePlacedSeedsMap() {
        const placedSeeds: StringMap<Map<number, number>> = {};
        
        Object.keys(this.nextState$.value!.flowerTypes).forEach(type => {
            placedSeeds[type] = new Map<number, number>();
        })
        return placedSeeds;
    }

    private getBlankSeedStatusDelta(): StringMap<SeedStatusDelta> {
        const seedStatusDelta = {};
        Object.keys(this.nextState$.value!.seedStatus).forEach(
            key => {
                seedStatusDelta[key] = {type: key, quantity: 0, progress: 0};
            });
        return seedStatusDelta;
    }

    private getCopiedState(): GameStateData {
        const currentState = this.nextState$.value;
        const nextRandomNumberSeed = currentState!.getRandomNumberSeed();
        const copiedData = JSON.parse(JSON.stringify(currentState)) as GameStateData;
        return {
            ...copiedData, randomNumberGeneratorSeed: nextRandomNumberSeed
        };
    }

    private getBlankDelta(): GameStateDelta {
        return {
            flowerDelta: this.nextState$.value!.flowers.map(_ => ({growth: 0})),
            tileSoilDelta: this.nextState$.value!.tiles.map((_, index, array) => ({
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
        const delta = this.getBlankDelta();
        calculateRiverEffects(this.nextState$.value!, delta);
        calculateFlowerEffects(this.nextState$.value!, delta);
        return delta;
    }

    nextState() {
        const copiedData = this.getCopiedState();

        const {
            tileSoilDelta,
            flowerDelta,
            seedStatusDelta,
            placedSeeds
        } = this.nextDelta$.value!;

        tileSoilDelta.forEach((soilDelta, index) => {
            copiedData.tiles[index].soil.nitrogenContent += soilDelta.nitrogen;
            copiedData.tiles[index].soil.phosphorousContent += soilDelta.phosphorous;
            copiedData.tiles[index].soil.potassiumContent += soilDelta.potassium;
        });

        copiedData.flowers.forEach((copiedFlower, flowerIndex) => {
            const { growth } = flowerDelta[flowerIndex];
            copiedFlower.growth += growth;
        });
        
        Object.keys(placedSeeds).forEach(type => {
            placedSeeds[type].forEach((seedAmount, tileIndex) => {
                if (seedAmount > 0) {
                    copiedData.flowers.push({
                        index: copiedData.flowers.length,
                        x: tileIndex % this.nextState$.value!.numTilesX,
                        y: Math.floor(tileIndex / this.nextState$.value!.numTilesX),
                        type,
                        growth: 0,
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

        const newState = new GameState(copiedData);
        this.nextState$.next(newState);
        this.nextDelta$.next(this.calculateDelta());
    }

    nextStateObservable(): Observable<GameState> {
        return this.nextState$.pipe(
            filter(state => state != null),
            map(state => state!));
    }

    nextDeltaObservable(): Observable<GameStateDelta> {
        return this.nextDelta$.pipe(
            filter(delta => delta != null),
            map(delta => delta!)
        );
    }

    loadMapObservable(): Observable<GameState> {
        return this.loadMap$;
    }

    moveSeed(type: string, previousTileIndex: number, nextTileIndex: number) {
        const delta = this.nextDelta$.value!;
        this._removeSeed(delta, type, previousTileIndex);
        this._addSeed(delta, type, nextTileIndex);
        this.nextDelta$.next(delta);
    }

    placeSeed(type: string, tileIndex: number) {
        const delta = this.nextDelta$.value!;
        delta.seedStatusDelta[type].quantity--;
        this._addSeed(delta, type, tileIndex);
        this.nextDelta$.next(delta);
    }

    removeSeed(type: string, tileIndex: number) {
        const delta = this.nextDelta$.value!;
        delta.seedStatusDelta[type].quantity++;
        this._removeSeed(delta, type, tileIndex);
        this.nextDelta$.next(delta);
    }

    applyEvolveResult(seeds: Array<{type: string, amount: number}>, newFlower: FlowerType) {
        const updatedDelta = this.nextDelta$.value!;
        
        const copiedData = this.getCopiedState();
        copiedData.flowerTypes[newFlower.type] = newFlower;
        copiedData.seedStatus[newFlower.type] = {
            type: newFlower.type,
            quantity: 1,
            progress: 0
        };
        updatedDelta.placedSeeds[newFlower.type] = new Map<number, number>();
        updatedDelta.seedStatusDelta[newFlower.type] = {
            type: newFlower.type,
            quantity: 0,
            progress: 0
        }
        seeds.forEach((seed) => {
            copiedData.seedStatus[seed.type].quantity -= seed.amount;
        });
        this.nextState$.next(new GameState(copiedData));
        this.nextDelta$.next(updatedDelta);
    }

    deleteSeeds(seeds: Array<{type: string, amount: number}>) {
        const updatedState = this.nextState$.value!;
        seeds.forEach((seed) => {
            updatedState.seedStatus[seed.type].quantity -= seed.amount;
        });
        this.nextState$.next(updatedState);
    }

    private _addSeed(delta: GameStateDelta, type: string, tileIndex: number) {
        let existingAmount = 0;
        if (delta.placedSeeds[type].has(tileIndex)) {
            existingAmount = delta.placedSeeds[type].get(tileIndex)!;
        }
        delta.placedSeeds[type].set(tileIndex, existingAmount + 1);
    }
    private _removeSeed(delta: GameStateDelta, type: string, tileIndex: number) {
        delta.placedSeeds[type].set(tileIndex, delta.placedSeeds[type].get(tileIndex)! -1);
    }
}
