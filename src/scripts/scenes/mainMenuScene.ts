import { gameStateController, guiController, mapController, mainMenuController, savedGameController } from "../game";
import { combineLatest, merge, Observable, Subject } from "rxjs";
import { TutorialRunner } from "../tutorial/TutorialRunner";
import { Tutorial1 } from "../tutorial/Tutorial1";
import { Tutorial2 } from "../tutorial/Tutorial2";
import { filter, mapTo, startWith, tap, first, skip, flatMap } from "rxjs/operators";
import { TutorialSelectView } from "../views/MainMenu/TutorialSelectView";
import { MainMenuView } from "../views/MainMenu/MainMenuView";
import { Tutorial3 } from "../tutorial/Tutorial3";
import { GameStateData, GameState } from "../objects/GameState";
import { NewGameView } from "../views/MainMenu/NewGameView";
import { LevelConfig } from "../controllers/MainMenuController";
import { LoadGameView } from "../views/MainMenu/LoadGameView";

export default class MainMenuScene extends Phaser.Scene {
    constructor() {
		super({ key: 'MainMenuScene' })
    }

    create() {
        guiController.setScreenState("Main Menu");
        mainMenuController.setActiveMenuScreen("MAIN_MENU");
        this.scene.launch("PreloadScene");
        new TutorialSelectView(this, mainMenuController);
        new MainMenuView(this, mainMenuController, gameStateController);
        new NewGameView(this, mainMenuController);
        new LoadGameView(this, mainMenuController, savedGameController);

        const onLoadedGameAssets$ = mainMenuController.onFinishedLoadingGameAssetsObservable();
        const onSelectLevel$ = mainMenuController.loadLevelObservable();
        const onLoadMap$ = mainMenuController.loadMapObservable();
        combineLatest(
            merge(
                onSelectLevel$.pipe(flatMap(levelConfig => this.loadMap(levelConfig))),
                onLoadMap$
            ),
            onLoadedGameAssets$.pipe(mapTo(true), startWith(false))
        ).pipe(
            tap(([gameStateData, isAssetsLoaded]) => {
                if (!isAssetsLoaded) {
                    mainMenuController.setLoadState("LOADING_GAME_ASSETS")
                }
            }),
            filter(([gameStateData, isAssetsLoaded]) => isAssetsLoaded)
        ).subscribe(([gameStateData]) => {
            mainMenuController.setLoadState("LOADING_MAP_DATA");
            gameStateController.loadGame(gameStateData);
        });

        gameStateController.loadMapObservable().pipe(first()).subscribe(() => {
            this.scene.launch('MainScene');
            this.scene.launch('UIScene');
            this.scene.launch('EvolveSeedScene');
            this.scene.launch('OverlayScene');
            mainMenuController.setLoadState("FINISHED");
            guiController.setScreenState("In Game");
            gameStateController.setGamePhase("INIT");
        });

        gameStateController.loadMapObservable().pipe(skip(1)).subscribe(() => {
            mainMenuController.setLoadState("FINISHED");
            guiController.setScreenState("In Game");
            gameStateController.setGamePhase("INIT");
        })

        guiController.screenStateObservable().subscribe(screenState => {
            if (screenState === 'Main Menu') {
                this.scene.setVisible(true);
                this.scene.resume();
            } else {
                this.scene.setVisible(false);
                this.scene.pause();
            }
        });
    }
    
	loadMap(levelConfig: LevelConfig): Observable<GameStateData> {
        const { mapName, player1, player2 } = levelConfig;
        const gameState$ = new Subject<GameStateData>();
        const tutorialRunner = new TutorialRunner(guiController, mapController, gameStateController)

        this.load.on('complete', () => {
            const initialState = this.cache.json.get(`data-${mapName}`) as GameStateData;

            if (mapName === "tutorial1") {
                tutorialRunner.runTutorial(new Tutorial1());
            }
            if (mapName === "tutorial2") {
                tutorialRunner.runTutorial(new Tutorial2());
            }
            if (mapName === "tutorial3") {
                tutorialRunner.runTutorial(new Tutorial3());
            }

            const playerList = Object.keys(initialState.players).map(key => initialState.players[key]);

            if (player1 != null) {
                playerList[0].controlledBy = player1;
            }
            if (player2 != null) {
                playerList[1].controlledBy = player2;
            }

            gameState$.next(initialState);
            this.load.removeAllListeners();
        }, this)

        this.load.json(`data-${mapName}`, `assets/maps/${mapName}.json`);
        this.load.start();

        return gameState$;
	}
}