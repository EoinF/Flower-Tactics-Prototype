import { Subject, Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";

interface HeldObject {
    type: 'SEED' | 'CLOUD',
    data: HeldSeedData | null
}

export interface HeldSeedData {
    type: string;
    tileIndex: number | null;
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
            data: null
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
    
    isHoldingCloudObservable(): Observable<boolean> {
        return this.heldObject$
            .pipe(
                map(heldObject => (heldObject != null && heldObject.type === 'CLOUD')),
                startWith(false)
            );
    }
}