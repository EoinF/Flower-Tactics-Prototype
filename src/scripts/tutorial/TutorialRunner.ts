import { GuiController } from "../controllers/GuiController";
import { GameStateManager } from "../controllers/GameStateManager";
import { first, withLatestFrom, skip } from "rxjs/operators";
import { TutorialBase } from "./TutorialBase";
import { Subject, combineLatest } from "rxjs";
import { Tile } from "../objects/Tile";
import { MapController } from "../controllers/MapController";
import { MessagePrompt } from "../views/MessageQueueView";

export interface TutorialRunnerCallbacks {
    showTips: (messages: MessagePrompt[]) => void;
    focusTile: (tile: Tile) => void;
    victory: () => void;
}

export class TutorialRunner {
    private guiController: GuiController;
    private mapController: MapController;
    private gameStateManager: GameStateManager;
    private tutorial$: Subject<TutorialBase>;
    
    constructor(guiController: GuiController, mapController: MapController, gameStateManager: GameStateManager) {
        this.tutorial$ = new Subject();
        this.guiController = guiController;
        this.mapController = mapController;
        this.gameStateManager = gameStateManager;

        const callbacks = {
            showTips: (messages: MessagePrompt[]) => this.showTips(messages),
            focusTile: (tile: Tile) => this.focusTile(tile),
            victory: () => this.victory()
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

    private showTips(messages: MessagePrompt[]) {
        this.guiController.createMessagePromptQueue(messages);
    }

    private focusTile(tile: Tile) {
        combineLatest(this.mapController.cameraObservable(), this.gameStateManager.nextStateObservable())
            .pipe(first())
            .subscribe(([mapCamera, nextState]) => {
                const mapX = 48 * tile.index % nextState.numTilesX;
                const mapY = 48 * Math.floor(tile.index / nextState.numTilesX);
                mapCamera.setScroll(mapX - mapCamera.width / 2, mapY - mapCamera.height / 2);
            });
    }

    private victory() {
        this.guiController.createMessagePromptQueue([{
                title: "Victory",
                content: "Tutorial complete!",
                position: {x: 500, y: 300}
            }]
        );
    }

    runTutorial(tutorial: TutorialBase) {
        this.tutorial$.next(tutorial);
    }
}