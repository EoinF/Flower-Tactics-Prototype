import { GuiController } from "../controllers/GuiController";
import { GameStateController } from "../controllers/GameStateController";
import { first, withLatestFrom, skip, filter } from "rxjs/operators";
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
    private gameStateController: GameStateController;
    private tutorial$: Subject<TutorialBase | null>;
    
    constructor(guiController: GuiController, mapController: MapController, gameStateController: GameStateController) {
        this.tutorial$ = new Subject();
        this.guiController = guiController;
        this.mapController = mapController;
        this.gameStateController = gameStateController;

        const callbacks = {
            showTips: (messages: MessagePrompt[]) => this.showTips(messages),
            focusTile: (tile: Tile) => this.focusTile(tile),
            victory: () => this.victory()
        } as TutorialRunnerCallbacks;

        combineLatest(
            gameStateController.gameStateObservable()
            .pipe(
                first(),
            ),
            this.tutorial$
        ).pipe(
            filter(([_, tutorial]) => tutorial != null)
        ).subscribe(([state, tutorial]) => tutorial!.startGame(state, callbacks));

        gameStateController.gameStateObservable()
            .pipe(
                skip(1), 
                withLatestFrom(this.tutorial$),
                filter(([_, tutorial]) => tutorial != null)
            )
            .subscribe(([state, tutorial]) => tutorial!.stateChange(state, callbacks));
    }

    private showTips(messages: MessagePrompt[]) {
        this.guiController.createMessagePromptQueue(messages);
    }

    private focusTile(tile: Tile) {
        combineLatest(this.mapController.cameraObservable(), this.gameStateController.gameStateObservable())
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

        this.guiController.messagePromptObservable().pipe(
            filter(prompt => prompt == null),
            first()
        ).subscribe(() => {
            this.guiController.setScreenState("Main Menu");
            this.stopTutorial();
        })
    }

    runTutorial(tutorial: TutorialBase) {
        this.tutorial$.next(tutorial);
    }

    stopTutorial() {
        this.tutorial$.next(null);
    }
}