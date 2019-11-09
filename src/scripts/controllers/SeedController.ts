import { ReplaySubject, Observable, Subject } from "rxjs";
import { distinctUntilChanged } from "rxjs/operators";

interface DragSeed {
    type: string,
    x: number,
    y: number
}

export class SeedController {
    private dragSeed$: Subject<DragSeed | null>;
    private dropSeed$: Subject<DragSeed>;

    private mouseOverSeedContainer$: Subject<boolean>;
    private mouseOverSeedContainerDistinct$: Observable<boolean>;

    constructor() {
        this.dragSeed$ = new ReplaySubject(1);
        this.dropSeed$ = new ReplaySubject(1);
        this.mouseOverSeedContainer$ = new ReplaySubject(1);

        this.mouseOverSeedContainerDistinct$ = this.mouseOverSeedContainer$
            .pipe(distinctUntilChanged());
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

    setMouseOverSeedContainer(isHighlighted: boolean) {
        this.mouseOverSeedContainer$.next(isHighlighted);
    }

    dragSeedObservable(): Observable<DragSeed | null> {
        return this.dragSeed$;
    }

    dropSeedObservable(): Observable<DragSeed> {
        return this.dropSeed$;
    }

    mouseOverSeedContainerObservable(): Observable<boolean> {
        return this.mouseOverSeedContainerDistinct$;
    }
}