import { Observable, Subject, ReplaySubject, BehaviorSubject, timer } from 'rxjs';
import { map, distinctUntilChanged, startWith, delay, delayWhen } from 'rxjs/operators';
import { MessagePrompt, MessagePromptWithDelay } from '../views/MessageQueueView';
import { MapLocation } from './MapController';

interface MessagePromptQueue {
    messagePrompts: MessagePrompt[];
    index: number;
}

type ScreenState = "Main Menu" | "In Game" | "Evolve" | "Paused";

export class GuiController {
    private endTurn$: Subject<void>;
    private onClickInfoButton$: Subject<void>;
    private onClickEvolveButton$: Subject<void>;
    private onClickSeedPlacementButton$: Subject<void>;
    private onClickCloudPlacementButton$: Subject<void>;
    private revealSeedsOfType$: Subject<boolean>;
    private screenState$: Subject<ScreenState>;
    private alertMessage$: Subject<string>;
    private messagePromptQueue$: BehaviorSubject<MessagePromptQueue>;
    private mousePosition$: Subject<MapLocation>;
    private mouseOverSeedContainer$: Subject<boolean>;
    private mouseOverFlowerSelection$: Subject<boolean>;
    private inputManager$: Subject<Phaser.Types.Input.Keyboard.CursorKeys>;

    constructor() {
        this.endTurn$ = new ReplaySubject(1);
        this.onClickInfoButton$ = new Subject();
        this.onClickEvolveButton$ = new Subject();
        this.onClickSeedPlacementButton$ = new Subject();
        this.onClickCloudPlacementButton$ = new Subject();
        this.revealSeedsOfType$ = new Subject();
        this.screenState$ = new ReplaySubject(1);
        this.alertMessage$ = new Subject();
        this.messagePromptQueue$ = new BehaviorSubject({
            messagePrompts: [] as MessagePrompt[],
            index: 0
        });
        this.mousePosition$ = new Subject();
        this.mouseOverSeedContainer$ = new ReplaySubject(1);
        this.mouseOverFlowerSelection$ = new ReplaySubject(1);
        this.inputManager$ = new Subject();
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

    clickInfoButton() {
        this.onClickInfoButton$.next();
    }

    clickEvolveButton() {
        this.onClickEvolveButton$.next();
    }

    clickSeedPlacementButton() {
        this.onClickSeedPlacementButton$.next();
    }
    
    clickCloudPlacementButton() {
        this.onClickCloudPlacementButton$.next();
    }

    revealSeedsOfType() {
        this.revealSeedsOfType$.next(true);
    }

    disableRevealSeedsOfType() {
        this.revealSeedsOfType$.next(false);
    }

    setScreenState(screenState: ScreenState) {
        this.screenState$.next(screenState);
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

    setMousePosition(x: number, y: number) {
        this.mousePosition$.next({x, y});
    }

    setInputManager(inputManager: Phaser.Types.Input.Keyboard.CursorKeys) {
        this.inputManager$.next(inputManager);
    }

    onClickInfoButtonObservable(): Observable<void> {
        return this.onClickInfoButton$;
    }
    onClickEvolveButtonObservable(): Observable<void> {
        return this.onClickEvolveButton$;
    }
    onClickSeedPlacementButtonObservable(): Observable<void> {
        return this.onClickSeedPlacementButton$;
    }
    onClickCloudPlacementButtonObservable(): Observable<void> {
        return this.onClickCloudPlacementButton$;
    }
    
    revealSeedsOfTypeObservable(): Observable<boolean> {
        return this.revealSeedsOfType$;
    }

    screenStateObservable(): Observable<ScreenState> {
        return this.screenState$;
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
                delayWhen((messagePrompt) => timer(
                    messagePrompt != null && (messagePrompt.hasOwnProperty('delay')) 
                    ? (messagePrompt as MessagePromptWithDelay).delay
                    : 0)),
                distinctUntilChanged(),
            )
    }

    isLastPromptObservable(): Observable<boolean> {
        return this.messagePromptQueue$
            .pipe(
                map(({index, messagePrompts}) => index === messagePrompts.length - 1)
            )
    }

    mousePositionObservable(): Observable<MapLocation> {
        return this.mousePosition$;
    }

    inputManagerObservable(): Observable<Phaser.Types.Input.Keyboard.CursorKeys> {
        return this.inputManager$;
    }
}