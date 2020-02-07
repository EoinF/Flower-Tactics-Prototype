import { Subject, Observable, merge, of, ReplaySubject } from "rxjs";
import { scan, map, shareReplay, startWith, mapTo, debounceTime, throttleTime, filter, tap, take, flatMap } from "rxjs/operators";
import { StringMap } from "../types";

interface PlacedSeedInstance {
    type: string;
    tileIndex: number;
    ownerId: string;
}

interface PlacedCloud {
    cloudKey: string;
    tileIndex: number;
}

export type PlacedSeed = PlacedSeedInstance & {
    amount: number;
}

interface PlacedSeedEvent {
    isReset: boolean;
    data: SeedTypeToPlacedSeedsMap | PlacedSeedInstance | null;
    delta: number;
}

interface PlayerStatus {
    playerId: string;
    hasEndedTurn: boolean;
}

export class SeedTypeToPlacedSeedsMap {
    private map: Map<string, Map<number, PlacedSeed>>;
    
    constructor() {
        this.map = new Map<string, Map<number, PlacedSeed>>();
    }
    
    getSeedsAtTile(tileIndex: number) {
        const seedsAtTile: Array<PlacedSeed> = [];
        this.map.forEach(tileIndexMap => {
            if (tileIndexMap.has(tileIndex)) {
                seedsAtTile.push(tileIndexMap.get(tileIndex)!);
            }
        });
        return seedsAtTile;
    }

    getAllSeeds(): PlacedSeed[] {
        const allSeeds: Array<PlacedSeed> = [];
        this.map.forEach((tileIndexMap) => {
            tileIndexMap.forEach((placedSeed) => allSeeds.push(placedSeed))
        });
        return allSeeds;
    }

    addPlacedSeed(type: string, tileIndex: number, ownerId: string, delta: number = +1) {
        const existingValueOfType = this.map.get(type);

        let tileIndexMap: Map<number, PlacedSeed>;
        if (existingValueOfType == null) {
            tileIndexMap = new Map<number, PlacedSeed>();
            tileIndexMap.set(tileIndex, { type, tileIndex, ownerId, amount: delta });
        } else {
            tileIndexMap = existingValueOfType;
            const existingValueAtTileIndex = tileIndexMap.get(tileIndex);
            if (existingValueAtTileIndex == null) {
                tileIndexMap.set(tileIndex, { type, tileIndex, ownerId, amount: delta });
            } else {
                tileIndexMap.set(tileIndex, { type, tileIndex, ownerId, amount: existingValueAtTileIndex.amount + delta });
            }
        }
        this.map.set(type, tileIndexMap);
    }

    clone(): SeedTypeToPlacedSeedsMap {
        const newMap = new SeedTypeToPlacedSeedsMap();
        this.map.forEach((tileIndexMap, type) => {
            let newTileIndexMap = new Map<number, PlacedSeed>();
            tileIndexMap.forEach((placedSeed, tileIndex) => {
                newTileIndexMap.set(tileIndex, {
                    type, tileIndex, ownerId: placedSeed.ownerId, amount: placedSeed.amount
                });
            });
            newMap.map.set(type, newTileIndexMap);
        });
        return newMap;
    }
}

export class GameActionController {
    private endTurnPlayerId$: Subject<string>;
    private endTurnAllPlayers$: Observable<void>;
    private players$: Subject<string[]>;
    private placeSeed$: Subject<PlacedSeedInstance>;
    private removeSeed$: Subject<PlacedSeedInstance>;
    private resetSeeds$: Subject<SeedTypeToPlacedSeedsMap>;
    private placedSeedsMap$: Observable<SeedTypeToPlacedSeedsMap>;
    private onPlaceCloud$: Subject<PlacedCloud>;
    private resetClouds$: Subject<void>;

    constructor() {
        this.placeSeed$ = new Subject();
        this.removeSeed$ = new Subject();
        this.resetSeeds$ = new Subject();
        this.onPlaceCloud$ = new Subject();
        this.resetClouds$ = new Subject();
        this.endTurnPlayerId$ = new Subject();
        this.players$ = new Subject();

        this.placedSeedsMap$ =
            merge(
                this.placeSeed$.pipe(
                    map(placedSeed => ({ isReset: false, data: placedSeed, delta: +1}))
                ),
                this.removeSeed$.pipe(
                    map(placedSeed => ({ isReset: false, data: placedSeed, delta: -1}))
                ),
                this.resetSeeds$.pipe(
                    startWith(new SeedTypeToPlacedSeedsMap()), map(placedSeedsMap => ({ isReset: true, data: placedSeedsMap, delta: 0 }))
                )
            ).pipe(
                scan((placedSeeds: SeedTypeToPlacedSeedsMap, nextEvent: PlacedSeedEvent) => {
                    if (nextEvent.isReset) {
                        return nextEvent.data as SeedTypeToPlacedSeedsMap;
                    } else {
                        const {
                            type, tileIndex, ownerId
                        } = nextEvent.data! as PlacedSeedInstance;
                        const delta = nextEvent.delta;
                        placedSeeds.addPlacedSeed(type, tileIndex, ownerId, delta);
                        return placedSeeds;
                    }
                }, new SeedTypeToPlacedSeedsMap()),
                shareReplay(1)
            );

        this.endTurnAllPlayers$ = merge(
            this.endTurnPlayerId$.pipe(
                map(playerId => ({playerId, hasEndedTurn: true}))
            ),
            this.players$.pipe(
                flatMap(players => players.map(playerId => ({playerId, hasEndedTurn: false})))
            )
        ).pipe(
            scan<PlayerStatus, PlayerStatus[]>((currentState, nextState) => {
                let updatedState: PlayerStatus[] = JSON.parse(JSON.stringify(currentState));
                if (currentState.every(playerState => playerState.hasEndedTurn)) {
                    updatedState = updatedState.map(playerState => ({ ...playerState, hasEndedTurn: false }));
                }
                const existingIndex = updatedState.findIndex(state => state.playerId === nextState.playerId);
                if (existingIndex !== -1) {
                    updatedState[existingIndex].hasEndedTurn = nextState.hasEndedTurn;
                } else {
                    updatedState.push(nextState)
                }
                return updatedState;
            }, []),
            filter(endTurnArray => endTurnArray.every(playerState => playerState.hasEndedTurn)),
            mapTo(undefined)
        )
    }

    placeSeed(type: string, tileIndex: number, ownerId: string) {
        this.placeSeed$.next({ type, tileIndex, ownerId });
    }

    removeSeed(type: string, tileIndex: number, ownerId: string) {
        this.removeSeed$.next({ type, tileIndex, ownerId });
    }

    resetSeeds(placedSeedsMap: SeedTypeToPlacedSeedsMap = new SeedTypeToPlacedSeedsMap()) {
        this.resetSeeds$.next(placedSeedsMap);
    }

    placeCloud(cloudKey: string, tileIndex: number) {
        this.onPlaceCloud$.next({cloudKey, tileIndex});
    }
    
    resetClouds() {
        this.resetClouds$.next();
    }

    setPlayers(playerIds: string[]) {
        this.players$.next(playerIds);
    }

    endTurn(playerId: string) {
        this.endTurnPlayerId$.next(playerId);
    }

    onPlaceSeedObservable(): Observable<PlacedSeedInstance> {
        return this.placeSeed$;
    }

    onRemoveSeedObservable(): Observable<PlacedSeedInstance> {
        return this.removeSeed$;
    }

    placedSeedsMapObservable() {
        return this.placedSeedsMap$;
    }

    placedCloudsObservable(): Observable<StringMap<number>> {
        return merge(
            this.onPlaceCloud$.pipe(map(placedCloud => ({isReset: false, cloudKey: placedCloud.cloudKey, tileIndex: placedCloud.tileIndex}))),
            this.resetClouds$.pipe(startWith(null), mapTo({isReset: true, cloudKey: null, tileIndex: null}))
        ).pipe(
            scan((accumulator, nextValue) => {
                if (nextValue.isReset) {
                    return [];
                } else {
                    return {
                        ...accumulator,
                        [nextValue.cloudKey!]: nextValue.tileIndex
                    };
                }
            }, {}),
            shareReplay()
        );
    }

    endOfTurnObservable(): Observable<void> {
        return this.endTurnAllPlayers$;
    }
}