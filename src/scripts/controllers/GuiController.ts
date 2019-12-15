import { Observable, Subject, ReplaySubject, BehaviorSubject } from 'rxjs';
import { map, withLatestFrom, distinctUntilChanged, publishReplay, shareReplay, tap } from 'rxjs/operators';
import { MessagePrompt } from '../views/MessageQueueView';

interface MessagePromptQueue {
    messagePrompts: MessagePrompt[];
    index: number;
}

export class GuiController {
    private endTurn$: Subject<void>;
    private onClickInfoButton$: Subject<void>;
    private alertMessage$: Subject<string>;
    private messagePromptQueue$: BehaviorSubject<MessagePromptQueue>

    constructor() {
        this.endTurn$ = new ReplaySubject(1);
        this.onClickInfoButton$ = new ReplaySubject(1);
        this.alertMessage$ = new Subject();
        this.messagePromptQueue$ = new BehaviorSubject({
            messagePrompts: [] as MessagePrompt[],
            index: 0
        });
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
            {messagePrompts, index: 0}
        );
    }
    
    nextMessagePrompt() {
        this.messagePromptQueue$.next({ 
            ...this.messagePromptQueue$.value, 
            index: this.messagePromptQueue$.value.index + 1});
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
        return this.messagePromptQueue$
            .pipe(
                map(({index, messagePrompts}) => messagePrompts != null && index < messagePrompts.length ? messagePrompts[index] : null),
                distinctUntilChanged(),
            )
    }

    isLastPromptObservable(): Observable<boolean> {
        return this.messagePromptQueue$
            .pipe(
                map(({index, messagePrompts}) => index === messagePrompts.length - 1)
            )
    }
}