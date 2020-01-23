import { GuiController } from "../controllers/GuiController";
import { GameStateController } from "../controllers/GameStateController";
import { first, withLatestFrom, skip, filter, startWith, map, distinctUntilChanged } from "rxjs/operators";
import { TutorialBase } from "./TutorialBase";
import { Subject, combineLatest } from "rxjs";
import { Tile } from "../objects/Tile";
import { MapController } from "../controllers/MapController";
import { MessagePrompt } from "../views/MessageQueueView";
import { evolveSeedController } from "../game";
import { GameStateData, GameState } from "../objects/GameState";

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
        this.guiController = guiController;
        this.mapController = mapController;
        this.gameStateController = gameStateController;

        const callbacks: TutorialRunnerCallbacks = {
            showTips: (messages: MessagePrompt[]) => this.showTips(messages),
            focusTile: (tile: Tile) => this.focusTile(tile),
            victory: () => this.victory(),
            giftCloudToPlayer: () => this.giftCloudToPlayer()
        };
        
        const isEvolveScreenOpen$ = guiController.screenStateObservable().pipe(
            map(screenState => screenState === 'Evolve'),
            distinctUntilChanged(),
            startWith(false)
        )

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

    private giftCloudToPlayer() {
        this.gameStateController.gameStateObservable().pipe(
            first(),
            withLatestFrom(this.gameStateController.currentPlayerObservable())
        ).subscribe(([gameState, playerId]) => {
            console.log("Gifting cloud to player");
            const gameStateData = JSON.parse(JSON.stringify(gameState)) as GameStateData;

            gameStateData.players[playerId].cloudOwned = "1";
            gameStateData.clouds["1"] = {
                tileIndex: -1
            };
            this.gameStateController.setState(new GameState(gameStateData));
        })
    }

    runTutorial(tutorial: TutorialBase) {
        this.tutorial$.next(tutorial);
    }

    stopTutorial() {
        this.tutorial$.next(null);
    }
}