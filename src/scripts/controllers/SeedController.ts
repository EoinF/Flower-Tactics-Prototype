import { MapController } from "./MapController";
import { ReplaySubject, Observable } from "rxjs";
import { distinctUntilChanged } from "rxjs/operators";

interface DragSeed {
    type: string,
    x: number,
    y: number
}

export class SeedController {
    private startDragSeed$: ReplaySubject<DragSeed>;
    private dragSeed$: ReplaySubject<DragSeed | null>;
    private dropSeed$: ReplaySubject<DragSeed>;

    private mouseOverSeedContainer$: ReplaySubject<boolean>;

    constructor() {
        this.startDragSeed$ = new ReplaySubject(1);
        this.dragSeed$ = new ReplaySubject(1);
        this.dropSeed$ = new ReplaySubject(1);
        this.mouseOverSeedContainer$ = new ReplaySubject(1);
    }

    startDraggingSeed(type: string, savedPositionX: number, savedPositionY: number) {
        this.startDragSeed$.next({
            type,
            x: savedPositionX,
            y: savedPositionY
        })
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
    
    startDragSeedObservable(): Observable<DragSeed> {
        return this.startDragSeed$;
    }

    dragSeedObservable(): Observable<DragSeed | null> {
        return this.dragSeed$;
    }

    dropSeedObservable() {
        return this.dropSeed$;
    }

    mouseOverSeedContainerObservable() {
        return this.mouseOverSeedContainer$
            .pipe(distinctUntilChanged());
    }
}