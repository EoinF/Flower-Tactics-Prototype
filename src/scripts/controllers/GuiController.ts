import { Observable, Subject, ReplaySubject } from 'rxjs';
import { distinctUntilChanged, startWith } from 'rxjs/operators';

export class GuiController {
    private endTurn$: Subject<void>;
    private isMouseOverInfoButton$: Subject<boolean>;

    constructor() {
        this.endTurn$ = new ReplaySubject(1);
        this.isMouseOverInfoButton$ = new ReplaySubject(1);
    }

    setMouseOverInfoButton(isMouseOver: boolean) {
        this.isMouseOverInfoButton$.next(isMouseOver);
    }

    endTurn() {
        this.endTurn$.next();
    }

    mouseOverInfoButtonObservable(): Observable<boolean> {
        return this.isMouseOverInfoButton$.pipe(
            startWith(false),
            distinctUntilChanged()
        );
    }

    endTurnObservable(): Observable<void> {
        return this.endTurn$;
    }
}