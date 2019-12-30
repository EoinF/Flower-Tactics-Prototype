import { ReplaySubject, Observable, Subject } from "rxjs";
import { distinctUntilChanged, startWith } from "rxjs/operators";

interface DragSeed {
    x: number,
    y: number
}

type SeedOrigin = 'SEED_ORIGIN_MAP' | 'SEED_ORIGIN_INVENTORY';

export interface HeldSeed {
    tileIndex: number | null;
    type: string;
    origin: SeedOrigin;
}

export class SeedController {
    private resetPickedUpSeed$: Subject<void>;
    private pickUpSeed$: Subject<HeldSeed>;
    private dragSeed$: Subject<DragSeed | null>;
    private dropSeed$: Subject<DragSeed>;

    private mouseOverSeedContainer$: Subject<boolean>;
    private mouseOverFlowerSelection$: Subject<boolean>;

    constructor() {
        this.pickUpSeed$ = new ReplaySubject(1);
        this.resetPickedUpSeed$ = new Subject();
        this.dragSeed$ = new ReplaySubject(1);
        this.dropSeed$ = new Subject();
        this.mouseOverSeedContainer$ = new ReplaySubject(1);
        this.mouseOverFlowerSelection$ = new ReplaySubject(1);
    }

    pickUpSeed(type: string, tileIndex: number | null, origin: SeedOrigin) {
        this.pickUpSeed$.next({type, tileIndex, origin});
    }

    resetPickedUpSeed() {
        this.resetPickedUpSeed$.next();
    }

    dragSeed(x: number, y: number) {
        this.dragSeed$.next({
            x, y
        })
    }

    dropSeed(x: number, y: number) {
        this.dropSeed$.next({
            x, y
        });
        this.dragSeed$.next(null);
    }

    setMouseOverFlowerSelector(isMouseOver: boolean) {
        this.mouseOverFlowerSelection$.next(isMouseOver);
    }

    setMouseOverSeedContainer(isMouseOver: boolean) {
        this.mouseOverSeedContainer$.next(isMouseOver);
    }
    
    pickUpSeedObservable(): Observable<HeldSeed> {
        return this.pickUpSeed$;
    }

    resetPickedUpSeedObservable(): Observable<void> {
        return this.resetPickedUpSeed$;
    }

    dragSeedObservable(): Observable<DragSeed | null> {
        return this.dragSeed$;
    }

    dropSeedObservable(): Observable<DragSeed> {
        return this.dropSeed$;
    }

    mouseOverSeedContainerObservable(): Observable<boolean> {
        return this.mouseOverSeedContainer$
            .pipe(
                startWith(false),
                distinctUntilChanged()
            );
    }

    mouseOverFlowerSelectionObservable(): Observable<boolean> {
        return this.mouseOverFlowerSelection$
            .pipe(
                startWith(false),
                distinctUntilChanged()
            );
    }
}