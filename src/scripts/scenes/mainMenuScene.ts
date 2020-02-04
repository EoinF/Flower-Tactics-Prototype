import { gameStateController, guiController, mapController, mainMenuController } from "../game";
import { combineLatest } from "rxjs";
import { TutorialRunner } from "../tutorial/TutorialRunner";
import { SoilColourConverter } from "../SoilColourConverter";
import { Tutorial1 } from "../tutorial/Tutorial1";
import { Tutorial2 } from "../tutorial/Tutorial2";
import { filter, mapTo, startWith, tap, first, skip } from "rxjs/operators";
import { LevelSelectView } from "../views/MainMenu/LevelSelectView";
import { MainMenuView } from "../views/MainMenu/MainMenuView";
import { Tutorial3 } from "../tutorial/Tutorial3";
import { GameStateData } from "../objects/GameState";

export default class MainMenuScene extends Phaser.Scene {
    constructor() {
		super({ key: 'MainMenuScene' })
    }

    create() {
        guiController.setScreenState("Main Menu");
        mainMenuController.setActiveMenuScreen("MAIN_MENU");
        this.scene.launch("PreloadScene");
        new LevelSelectView(this, mainMenuController);
        new MainMenuView(this, mainMenuController, gameStateController);

        const onLoadedGameAssets$ = mainMenuController.onFinishedLoadingGameAssetsObservable();
        const onSelectLevel$ = mainMenuController.loadLevelObservable();
        combineLatest(
            onSelectLevel$,
            onLoadedGameAssets$.pipe(mapTo(true), startWith(false))
        ).pipe(
            tap(([levelName, isAssetsLoaded]) => {
                if (!isAssetsLoaded) {
                    mainMenuController.setLoadState("LOADING_GAME_ASSETS")
                }
            }),
            filter(([levelName, isAssetsLoaded]) => isAssetsLoaded)
        ).subscribe(([levelName]) => {
            mainMenuController.setLoadState("LOADING_MAP_DATA");
            this.loadMap(levelName);
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
    
	loadMap(mapName: string) {
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

            gameStateController.loadGame(initialState);
            this.load.removeAllListeners();
        }, this)

        this.load.json(`data-${mapName}`, `assets/maps/${mapName}.json`);
        this.load.start();
	}
}