import { GuiController } from "../controllers/GuiController";
import { GameStateController } from "../controllers/GameStateController";
import { first, withLatestFrom, skip, filter, startWith, map, distinctUntilChanged, mergeMap, tap, flatMap } from "rxjs/operators";
import { TutorialBase } from "./TutorialBase";
import { Subject, combineLatest } from "rxjs";
import { Tile } from "../objects/Tile";
import { MapController } from "../controllers/MapController";
import { MessagePrompt } from "../views/MessageQueueView";
import { evolveSeedController } from "../game";
import { GameStateData, GameState } from "../objects/GameState";
import { GameStateDelta } from "../objects/GameStateDelta";

export interface TutorialRunnerCallbacks {
    showTips: (messages: MessagePrompt[]) => void;
    giftCloudToPlayer: () => void;
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
        const victory$ = new Subject();
        const giftCloudToPlayer$ = new Subject();
        this.guiController = guiController;
        this.mapController = mapController;
        this.gameStateController = gameStateController;

        const callbacks: TutorialRunnerCallbacks = {
            showTips: (messages: MessagePrompt[]) => this.showTips(messages),
            focusTile: (tile: Tile) => this.focusTile(tile),
            victory: () => victory$.next(),
            giftCloudToPlayer: () => giftCloudToPlayer$.next()
        };
        
        const isEvolveScreenOpen$ = guiController.screenStateObservable().pipe(
            map(screenState => screenState === 'Evolve'),
            distinctUntilChanged(),
            startWith(false)
        )

        victory$.pipe(
            tap(() => {
                this.guiController.createMessagePromptQueue([{
                    title: "Victory",
                    content: "Tutorial complete!",
                    position: {x: 500, y: 300}
                }]);
            }),
            flatMap(() => this.guiController.messagePromptObservable().pipe(
                filter(prompt => prompt == null),
                first()
            ))
        ).subscribe(() => {
            this.guiController.setScreenState("Main Menu");
            this.stopTutorial();
        });

        combineLatest(
            gameStateController.gameStateObservable()
                .pipe(
                    first()
                ),
            this.tutorial$
        ).pipe(
            filter(([_, tutorial]) => tutorial != null)
        ).subscribe(([state, tutorial]) => tutorial!.startGame(state, callbacks));

        combineLatest(
            gameStateController.gameStateObservable(),
            evolveSeedController.stagedSeedsObservable(),
            isEvolveScreenOpen$,
            gameStateController.currentPlayerObservable()
        ).pipe(
            skip(1), 
            withLatestFrom(this.tutorial$),
            filter(([_, tutorial]) => tutorial != null)
        )
        .subscribe(([[state, stagedSeeds, isEvolveScreenOpen, playerId], tutorial]) => {
            tutorial!.stateChange(state, playerId, isEvolveScreenOpen, stagedSeeds, callbacks);
        });

        giftCloudToPlayer$.pipe(
            withLatestFrom(this.gameStateController.currentPlayerObservable())
        ).subscribe(([_, playerId]) => {
            console.log("Gifting cloud to player");
            const delta = new GameStateDelta();

            delta.addDelta(["players", playerId, "cloudOwned"], "1", "DELTA_REPLACE");
            delta.addDelta(["clouds", "1"], {
                tileIndex: -1
            }, "DELTA_REPLACE");
            this.gameStateController.applyDelta(delta);
        })
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

    runTutorial(tutorial: TutorialBase) {
        this.tutorial$.next(tutorial);
    }

    stopTutorial() {
        this.tutorial$.next(null);
    }
}