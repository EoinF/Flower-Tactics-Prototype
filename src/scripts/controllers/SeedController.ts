import { ReplaySubject, Observable, Subject } from "rxjs";
import { distinctUntilChanged, startWith } from "rxjs/operators";


export class SeedController {
    private mouseOverSeedContainer$: Subject<boolean>;
    private mouseOverFlowerSelection$: Subject<boolean>;

    constructor() {
        this.mouseOverSeedContainer$ = new ReplaySubject(1);
        this.mouseOverFlowerSelection$ = new ReplaySubject(1);
    }

    setMouseOverFlowerSelector(isMouseOver: boolean) {
        this.mouseOverFlowerSelection$.next(isMouseOver);
    }

    setMouseOverSeedContainer(isMouseOver: boolean) {
        this.mouseOverSeedContainer$.next(isMouseOver);
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