import { Observable, Subject, ReplaySubject } from 'rxjs';
import { distinctUntilChanged, startWith } from 'rxjs/operators';

export class GuiController {
    private endTurn$: Subject<void>;
    private onClickInfoButton$: Subject<void>;

    constructor() {
        this.endTurn$ = new ReplaySubject(1);
        this.onClickInfoButton$ = new ReplaySubject(1);
    }

    clickInfoButton() {
        this.onClickInfoButton$.next();
    }

    endTurn() {
        this.endTurn$.next();
    }

    onClickInfoButtonObservable(): Observable<void> {
        return this.onClickInfoButton$;
    }

    endTurnObservable(): Observable<void> {
        return this.endTurn$;
    }
}