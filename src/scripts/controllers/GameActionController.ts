import { Subject, Observable, merge, BehaviorSubject } from "rxjs";
import { scan, map, shareReplay, distinctUntilChanged, startWith, mapTo } from "rxjs/operators";

interface PlacedSeedInstance {
    type: string;
    tileIndex: number;
}

export type PlacedSeed = PlacedSeedInstance & {
    amount: number;
}

export type PlacedSeedsMap = Map<number, PlacedSeed>;

export class GameActionController {
    private placeSeed$: Subject<PlacedSeedInstance>;
    private removeSeed$: Subject<PlacedSeedInstance>;
    private resetSeeds$: Subject<void>;
    private placedSeedsMap$: Observable<PlacedSeedsMap>;
    private placedCloudsIndex$: BehaviorSubject<number | null>;

    constructor() {
        this.placeSeed$ = new Subject();
        this.removeSeed$ = new Subject();
        this.resetSeeds$ = new Subject();
        this.placedCloudsIndex$ = new BehaviorSubject<number | null>(null);

        this.placedSeedsMap$ =
            merge(
                this.placeSeed$.pipe(
                    map(placedSeed => ({ isReset: false, placedSeed, delta: +1}))
                ),
                this.removeSeed$.pipe(
                    map(placedSeed => ({ isReset: false, placedSeed, delta: -1}))
                ),
                this.resetSeeds$.pipe(startWith(null), mapTo({ isReset: true, placedSeed: null, delta: 0 }))
            ).pipe(
                scan((placedSeeds, nextEvent) => {
                    if (nextEvent.isReset) {
                        return new Map<number, PlacedSeed>();
                    } else {
                        const placedSeed = nextEvent.placedSeed!;
                        const delta = nextEvent.delta;
                        const existingValue = placedSeeds.get(placedSeed.tileIndex);
                        if (existingValue == null) {
                            placedSeeds.set(placedSeed.tileIndex, {...placedSeed, amount: 1});
                        } else {
                            placedSeeds.set(placedSeed.tileIndex, {...placedSeed, amount: existingValue.amount + delta})
                        }
                        return placedSeeds;
                    }
                }, new Map<number, PlacedSeed>()),
                shareReplay(1)
            );
    }

    placeSeed(type: string, tileIndex: number) {
        this.placeSeed$.next({ type, tileIndex });
    }

    removeSeed(type: string, tileIndex: number) {
        this.removeSeed$.next({ type, tileIndex });
    }

    resetSeeds() {
        this.resetSeeds$.next();
    }

    placeClouds(tileIndex: number) {
        this.placedCloudsIndex$.next(tileIndex);
    }
    
    resetClouds() {
        this.placedCloudsIndex$.next(null);
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

    placedCloudsObservable() {
        return this.placedCloudsIndex$.pipe(distinctUntilChanged());
    }
}