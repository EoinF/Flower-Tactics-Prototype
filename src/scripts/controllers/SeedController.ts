import { ReplaySubject, Observable, Subject } from "rxjs";
import { distinctUntilChanged, startWith } from "rxjs/operators";

interface DragSeed {
    type: string,
    x: number,
    y: number
}

type SeedOrigin = 'SEED_ORIGIN_MAP' | 'SEED_ORIGIN_INVENTORY';

type PickedUpSeed = DragSeed & {
    origin: SeedOrigin;
}

export class SeedController {
    private resetPickedUpSeed$: Subject<void>;
    private pickUpSeed$: Subject<PickedUpSeed>;
    private dragSeed$: Subject<DragSeed | null>;
    private dropSeed$: Subject<DragSeed>;

    private mouseOverSeedContainer$: Subject<boolean>;
    private mouseOverFlowerSelector$: Subject<boolean>;

    constructor() {
        this.pickUpSeed$ = new ReplaySubject(1);
        this.resetPickedUpSeed$ = new Subject();
        this.dragSeed$ = new ReplaySubject(1);
        this.dropSeed$ = new Subject();
        this.mouseOverSeedContainer$ = new ReplaySubject(1);
        this.mouseOverFlowerSelector$ = new ReplaySubject(1);
    }

    pickUpSeed(type: string, x: number, y: number, origin: SeedOrigin) {
        this.pickUpSeed$.next({type, x, y, origin})
    }

    resetPickedUpSeed() {
        this.resetPickedUpSeed$.next();
    }

    dragSeed(type: string, x: number, y: number) {
        this.dragSeed$.next({
            type, x, y
        })
    }

    dropSeed(type: string, x: number, y: number) {
        this.dropSeed$.next({
            type, x, y
        });
        this.dragSeed$.next(null);
    }

    setMouseOverFlowerSelector(isMouseOver: boolean) {
        this.mouseOverFlowerSelector$.next(isMouseOver);
    }

    setMouseOverSeedContainer(isMouseOver: boolean) {
        this.mouseOverSeedContainer$.next(isMouseOver);
    }
    
    pickUpSeedObservable(): Observable<PickedUpSeed> {
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

    mouseOverFlowerSelectorObservable(): Observable<boolean> {
        return this.mouseOverFlowerSelector$
            .pipe(
                startWith(false),
                distinctUntilChanged()
            );
    }
}