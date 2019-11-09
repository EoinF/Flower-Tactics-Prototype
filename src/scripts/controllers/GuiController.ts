import { Observable, Subject, ReplaySubject } from 'rxjs';

export class GuiController {
    private endTurn$: Subject<void>;

    constructor() {
        this.endTurn$ = new ReplaySubject(1);
    }

    endTurn() {
        this.endTurn$.next();
    }

    endTurnObservable(): Observable<void> {
        return this.endTurn$;
    }
}