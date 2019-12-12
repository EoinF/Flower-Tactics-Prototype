import { GuiController } from "../controllers/GuiController";
import { GameStateManager } from "../controllers/GameStateManager";
import { first, withLatestFrom, skip } from "rxjs/operators";
import { TutorialBase } from "./TutorialBase";
import { Subject, combineLatest } from "rxjs";


export interface TutorialRunnerCallbacks {
    showTips: (title: string, messages: string[]) => void;
}

export class TutorialRunner {
    private guiController: GuiController;
    private tutorial$: Subject<TutorialBase>;
    
    constructor(guiController: GuiController, gameStateManager: GameStateManager) {
        this.tutorial$ = new Subject();
        console.log(guiController);
        this.guiController = guiController;

        const callbacks = {
            showTips: (title: string, messages: string[]) => this.showTips(title, messages)
        } as TutorialRunnerCallbacks;

        combineLatest(
            gameStateManager.nextStateObservable()
            .pipe(
                first(),
            ),
            this.tutorial$
        ).subscribe(([state, tutorial]) => tutorial.startGame(state, callbacks));

        gameStateManager.nextStateObservable()
            .pipe(
                skip(1), 
                withLatestFrom(this.tutorial$)
            )
            .subscribe(([state, tutorial]) => tutorial.stateChange(state, callbacks));
    }

    private showTips(title: string, messages: string[]) {
        this.guiController.createAlertMessage(messages[0]);
    }

    runTutorial(tutorial: TutorialBase) {
        this.tutorial$.next(tutorial);
    }
}