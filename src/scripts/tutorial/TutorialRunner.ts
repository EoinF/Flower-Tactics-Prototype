import { GuiController } from "../controllers/GuiController";
import { GameStateManager } from "../controllers/GameStateManager";
import { first, withLatestFrom, skip } from "rxjs/operators";
import { TutorialBase } from "./TutorialBase";
import { Subject, combineLatest, Subscription } from "rxjs";
import { Tile } from "../objects/Tile";
import { MapController } from "../controllers/MapController";


export interface TutorialRunnerCallbacks {
    showTips: (title: string, messages: string[]) => void;
    focusTile: (tile: Tile) => void;
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
            showTips: (title: string, messages: string[]) => this.showTips(title, messages),
            focusTile: (tile: Tile) => this.focusTile(tile)
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

    private focusTile(tile: Tile) {
        combineLatest(this.mapController.cameraObservable(), this.gameStateManager.nextStateObservable())
            .pipe(first())
            .subscribe(([mapCamera, nextState]) => {
                const mapX = 48 * tile.index % nextState.numTilesX;
                const mapY = 48 * Math.floor(tile.index / nextState.numTilesX);
                mapCamera.setScroll(mapX - mapCamera.width / 2, mapY - mapCamera.height / 2);
            });
    }

    runTutorial(tutorial: TutorialBase) {
        this.tutorial$.next(tutorial);
    }
}