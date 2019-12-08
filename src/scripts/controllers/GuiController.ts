import { Observable, Subject, ReplaySubject } from 'rxjs';
import { distinctUntilChanged, startWith } from 'rxjs/operators';

export class GuiController {
    private endTurn$: Subject<void>;
    private onClickInfoButton$: Subject<void>;
    private alertMessage$: Subject<string>;

    constructor() {
        this.endTurn$ = new ReplaySubject(1);
        this.onClickInfoButton$ = new ReplaySubject(1);
        this.alertMessage$ = new Subject();
    }

    clickInfoButton() {
        this.onClickInfoButton$.next();
    }

    endTurn() {
        this.endTurn$.next();
    }

    createAlertMessage(message: string) {
        this.alertMessage$.next(message);
    }

    onClickInfoButtonObservable(): Observable<void> {
        return this.onClickInfoButton$;
    }

    endTurnObservable(): Observable<void> {
        return this.endTurn$;
    }
    
    alertMessageObservable(): Observable<string> {
        return this.alertMessage$;
    }
}