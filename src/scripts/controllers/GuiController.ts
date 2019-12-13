import { Observable, Subject, ReplaySubject, BehaviorSubject } from 'rxjs';
import { map, withLatestFrom, distinctUntilChanged } from 'rxjs/operators';
import { MessagePrompt } from '../views/MessageQueueView';

export class GuiController {
    private endTurn$: Subject<void>;
    private onClickInfoButton$: Subject<void>;
    private alertMessage$: Subject<string>;
    private messagePromptQueue$: Subject<MessagePrompt[]>
    private messagePromptQueueIndex$: BehaviorSubject<number>

    constructor() {
        this.endTurn$ = new ReplaySubject(1);
        this.onClickInfoButton$ = new ReplaySubject(1);
        this.alertMessage$ = new Subject();
        this.messagePromptQueue$ = new Subject();
        this.messagePromptQueueIndex$ = new BehaviorSubject(0);
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

    createMessagePromptQueue(messagePrompts: MessagePrompt[]) {
        this.messagePromptQueue$.next(
            messagePrompts
        );
        this.messagePromptQueueIndex$.next(
            0
        );
    }
    
    nextMessagePrompt() {
        this.messagePromptQueueIndex$.next(this.messagePromptQueueIndex$.value + 1);
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

    messagePromptObservable(): Observable<MessagePrompt | null> {
        return this.messagePromptQueueIndex$
            .pipe(
                withLatestFrom(this.messagePromptQueue$),
                map(([index, messageQueue]) => messageQueue != null && index < messageQueue.length ? messageQueue[index] : null),
                distinctUntilChanged()
            )
    }

    isLastPromptObservable(): Observable<boolean> {
        return this.messagePromptQueueIndex$
            .pipe(
                withLatestFrom(this.messagePromptQueue$),
                map(([index, messageQueue]) => index === messageQueue.length - 1)
            )
    }
}