import { Subject, Observable } from "rxjs";
import { filter, map, pairwise, startWith } from "rxjs/operators";

interface HeldObject {
    type: 'SEED' | 'CLOUD',
    data: HeldSeedData | HeldCloudData
}

type SeedOrigin = 'SEED_ORIGIN_MAP' | 'SEED_ORIGIN_INVENTORY';

type HeldCloudData = {};

export interface HeldSeedData {
    type: string;
    tileIndex: number | null;
    origin: SeedOrigin;
}

export class HeldObjectController {
    private heldObject$: Subject<HeldObject | null>;

    constructor() {
        this.heldObject$ = new Subject();
    }

    dropObject() {
        this.heldObject$.next(null);
    }

    pickUpClouds() {
        this.heldObject$.next({
            type: 'CLOUD',
            data: {}
        });
    }

    pickUpSeed(data: HeldSeedData) {
        this.heldObject$.next({
            type: 'SEED',
            data
        });
    }

    heldObjectObservable(): Observable<HeldObject | null> {
        return this.heldObject$.pipe(
            startWith(null)
        );
    }

    heldSeedObservable(): Observable<HeldSeedData | null> {
        return this.heldObject$
        .pipe(
            map(heldObject => (heldObject != null && heldObject.type === 'SEED') ? heldObject.data as HeldSeedData : null),
            startWith(null)
        );
    }
    
    heldCloudObservable(): Observable<HeldCloudData | null> {
        return this.heldObject$
        .pipe(
            map(heldObject => (heldObject != null && heldObject.type === 'CLOUD') ? heldObject.data as HeldCloudData : null),
            startWith(null)
        );
    }

    dropSeedObservable(): Observable<HeldSeedData> {
        return this.dropObjectObservable().pipe(
            filter(heldObject => heldObject.type === 'SEED'),
            map(object => object.data as HeldSeedData)
        );
    }

    dropObjectObservable() {
        return this.heldObject$.pipe(
            startWith(null),
            pairwise(),
            filter(([previous, current]) => previous != null && current == null),
            map(([previous, current]) => previous!)
        );
    }
}