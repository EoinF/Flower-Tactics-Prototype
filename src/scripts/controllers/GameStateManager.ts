import { GameState, GameStateData } from "../objects/GameState";
import { StringMap } from "../types";
import { Observable, ReplaySubject, BehaviorSubject, Subject } from "rxjs";
import { calculateRiverEffects } from "../deltaCalculators/calculateRiverDelta";
import { calculateFlowerEffects } from "../deltaCalculators/calculateFlowerDelta";
import { FlowerType } from "../objects/FlowerType";
import { map, filter } from "rxjs/operators";
import { Flower } from "../objects/Flower";
import { CLOUD_GRID_WIDTH } from "../constants";
import { SeedStatus } from "../objects/SeedStatus";

export interface FlowerDelta {
    growth: number;
    isNourished: boolean;
}

export interface SoilDelta {
    nitrogen: number;
    phosphorous: number;
    potassium: number;
}

export interface SeedStatusDelta {
    type: string;
    progress: number;
    quantity: number;
}

export interface PlayerDelta {
    flowersToRemove: string[];
    seedStatusDelta: string[];
}

export interface GameStateDelta {
    tileSoilDelta: Array<SoilDelta>;
    flowerDelta: StringMap<FlowerDelta>;
    seedStatusDelta: StringMap<SeedStatusDelta>;
    placedSeeds: StringMap<Map<number, number>>;
    placedCloudTileIndex: number | null;
}

export class GameStateManager {
    private loadMap$: ReplaySubject<GameState>;
    private nextState$: BehaviorSubject<GameState | null>;
    private nextDelta$: BehaviorSubject<GameStateDelta | null>;
    constructor(seed: number) {
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
            if (gameStateOrData.cloudLayoutSeed == null) {
                gameState.generateNextCloudLayout();
            }
        }
        
        this.nextState$.next(gameState);
        this.loadMap$.next(gameState);
        this.nextDelta$.next(this.calculateDelta(gameState));
    }

    private generatePlacedSeedsMap(gameState: GameState) {
        const placedSeeds: StringMap<Map<number, number>> = {};
        
        Object.keys(gameState.flowerTypes).forEach(type => {
            placedSeeds[type] = new Map<number, number>();
        })
        return placedSeeds;
    }

    private getBlankSeedStatusDelta(gameState: GameState): StringMap<SeedStatusDelta> {
        const seedStatusDelta = {};
        Object.keys(gameState.seedStatus).forEach(
            key => {
                seedStatusDelta[key] = {type: key, quantity: 0, progress: 0};
            });
        return seedStatusDelta;
    }

    private generateFlowerDeltaMap(gameState: GameState): StringMap<FlowerDelta> {
        const flowerDeltaMap: StringMap<FlowerDelta> = {};
        Object.keys(gameState.flowersMap).forEach(key => {
            flowerDeltaMap[key] = {
                growth: 0, isNourished: false
            };
        });

        return flowerDeltaMap;
    }

    private getCopiedState(): GameStateData {
        const currentState = this.nextState$.value;
        const nextRandomNumberSeed = currentState!.getRandomNumberSeed();
        const copiedData = JSON.parse(JSON.stringify(currentState)) as GameStateData;
        return {
            ...copiedData, randomNumberGeneratorSeed: nextRandomNumberSeed
        };
    }

    private getBlankDelta(gameState: GameState): GameStateDelta {
        return {
            flowerDelta: this.generateFlowerDeltaMap(gameState),
            tileSoilDelta: this.generateSoilDeltaMap(gameState),
            seedStatusDelta: this.getBlankSeedStatusDelta(gameState),
            placedSeeds: this.generatePlacedSeedsMap(gameState),
            placedCloudTileIndex: null
        };
    }

    private generateSoilDeltaMap(gameState: GameState): Array<SoilDelta> {
        return gameState.tiles.map((tile) => {
            if (tile.waterContent === 0 || tile.waterContent >= 10) {
                return {
                    nitrogen: -25,
                    potassium: -25,
                    phosphorous: -25
                }
            } else {
                return {
                    nitrogen: 0,
                    potassium: 0,
                    phosphorous: 0
                }
            }
        });
    }

    private calculateDelta(state: GameState) {
        const delta = this.getBlankDelta(state);
        calculateRiverEffects(state, delta);
        calculateFlowerEffects(state, delta);
        return delta;
    }

    nextState() {
        const gameState = this.nextState$.value!;
        const copiedData = this.getCopiedState();

        const {
            tileSoilDelta,
            flowerDelta,
            seedStatusDelta,
            placedSeeds,
            placedCloudTileIndex
        } = this.nextDelta$.value!;

        let flowersToRemove: string[] = [];
        Object.keys(gameState.flowersMap).forEach((key) => {
            const { growth, isNourished } = flowerDelta[key]!;
            if (isNourished) {
                copiedData.flowersMap[key].growth += growth;
            } else {
                const {
                    tenacity,
                    turnsUntilGrown
                } = copiedData.flowerTypes[gameState.flowersMap[key].type];
                const growthNeeded = turnsUntilGrown - copiedData.flowersMap[key].growth;
                let survivalChance = tenacity - growthNeeded * 5;
                if (gameState.getNextRandomNumber(0, 99) >= survivalChance) {
                    flowersToRemove.push(key);
                }
            }
        });
        
        flowersToRemove.forEach((key) => {
            const flower = gameState.flowersMap[key];
            const tile = gameState.getTileAt(flower.x, flower.y)!;
            const {
                soilConsumptionRate
            } = gameState.flowerTypes[flower.type];
            const returnedNutrients = soilConsumptionRate * flower.growth;
            tileSoilDelta[tile.index].nitrogen += returnedNutrients;
            tileSoilDelta[tile.index].phosphorous += returnedNutrients;
            tileSoilDelta[tile.index].potassium += returnedNutrients;
        });

        tileSoilDelta.forEach((soilDelta, tileIndex) => {
            copiedData.tiles[tileIndex].soil.nitrogenContent += soilDelta.nitrogen;
            copiedData.tiles[tileIndex].soil.phosphorousContent += soilDelta.phosphorous;
            copiedData.tiles[tileIndex].soil.potassiumContent += soilDelta.potassium;
        });
        
        let rainFallTiles: number[] = [];

        if (placedCloudTileIndex != null) {
            const cloudLayout = gameState.getCloudLayout();
            rainFallTiles = cloudLayout.map((isPlaced, index) => {
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

        copiedData.tiles.forEach((_, tileIndex) => {
            let waterDelta: number;
            if (rainFallTiles.indexOf(tileIndex) !== -1) {
                waterDelta = +3; // Rainfall adds 3 turns of water content to a tile
            } else if (copiedData.tiles[tileIndex].waterContent > 0) {
                waterDelta = -1; // Water content degrades by 1 per turn
            } else {
                waterDelta = 0;
            }
            copiedData.tiles[tileIndex].waterContent += waterDelta;
        });
        
        Object.keys(placedSeeds).forEach(type => {
            placedSeeds[type].forEach((seedAmount, tileIndex) => {
                if (seedAmount > 0) {
                    const newIndex = Math.max(...Object.keys(copiedData.flowersMap).map(type => parseInt(type))) + 1;
                    copiedData.flowersMap[newIndex] = {
                        index: newIndex,
                        x: tileIndex % this.nextState$.value!.numTilesX,
                        y: Math.floor(tileIndex / this.nextState$.value!.numTilesX),
                        type,
                        growth: 0
                    };
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

        flowersToRemove.forEach(key => {
            delete copiedData.flowersMap[key];
        });

        const newState = new GameState(copiedData);
        newState.generateNextCloudLayout();
        this.nextState$.next(newState);
        this.nextDelta$.next(this.calculateDelta(newState));
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

    placeClouds(tileIndex: number) {
        const delta = this.nextDelta$.value!;
        delta.placedCloudTileIndex = tileIndex;
        this.nextDelta$.next(delta);
    }

    removeSeed(type: string, tileIndex: number) {
        const delta = this.nextDelta$.value!;
        if (delta.placedSeeds[type].get(tileIndex) != null && delta.placedSeeds[type].get(tileIndex)! > 0) {
            delta.seedStatusDelta[type].quantity++;
            this._removeSeed(delta, type, tileIndex);
            this.nextDelta$.next(delta);
        }
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
