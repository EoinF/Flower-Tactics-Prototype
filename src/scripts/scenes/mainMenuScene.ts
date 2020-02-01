import { gameStateController, guiController, mapController, mainMenuController } from "../game";
import { combineLatest } from "rxjs";
import { MapLoader, ObjectData } from "../MapLoader";
import { MapSaver } from "../MapSaver";
import { TutorialRunner } from "../tutorial/TutorialRunner";
import { SoilColourConverter } from "../SoilColourConverter";
import { Tutorial1 } from "../tutorial/Tutorial1";
import { Tutorial2 } from "../tutorial/Tutorial2";
import { filter, mapTo, startWith, tap, first, skip } from "rxjs/operators";
import { LevelSelectView } from "../views/MainMenu/LevelSelectView";
import { MainMenuView } from "../views/MainMenu/MainMenuView";
import { Tutorial3 } from "../tutorial/Tutorial3";

export default class MainMenuScene extends Phaser.Scene {
    constructor() {
		super({ key: 'MainMenuScene' })
    }

    create() {
        guiController.setScreenState("Main Menu");
        mainMenuController.setActiveMenuScreen("MAIN_MENU");
        this.scene.launch("PreloadScene");
        new LevelSelectView(this, mainMenuController);
        new MainMenuView(this, mainMenuController);

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
        });

        gameStateController.loadMapObservable().pipe(skip(1)).subscribe(() => {
            mainMenuController.setLoadState("FINISHED");
            guiController.setScreenState("In Game");
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
        mainMenuController.loadLevel("tutorial3"); // TODO: Remove this
    }

	getMapImageData(textureKey: string) {
		const frame = this.textures.getFrame(textureKey);
		const cnv = this.textures.createCanvas('temp' + Math.random(), frame.width, frame.height);
		let ctx = cnv.getContext();
		ctx.clearRect(0, 0, frame.width, frame.height);
		ctx.drawImage(frame.source.image, 0, 0, frame.width, frame.height, 0, 0, frame.width, frame.height);

		const imageData = ctx.getImageData(0, 0, frame.width, frame.height);
		return imageData;
	}
    
	loadMap(mapName: string) {
        const soilColourConverter = new SoilColourConverter();
        const tutorialRunner = new TutorialRunner(guiController, mapController, gameStateController)
        const mapLoader = new MapLoader(soilColourConverter);

        this.load.on('complete', () => {
            const imageData = this.getMapImageData(`map-soil-${mapName}`);
            const objectData = this.cache.json.get(`object-data-${mapName}`) as ObjectData;

            const initialState = mapLoader.loadMap(imageData, objectData);

            // if (mapName === "tutorial1") {
            //     tutorialRunner.runTutorial(new Tutorial1());
            // }
            // if (mapName === "tutorial2") {
            //     tutorialRunner.runTutorial(new Tutorial2());
            // }
            // if (mapName === "tutorial3") {
            //     tutorialRunner.runTutorial(new Tutorial3());
            // }

            gameStateController.loadGame(initialState);
            this.load.removeAllListeners();
        }, this)

        this.load.image(`map-soil-${mapName}`, `assets/maps/parts/${mapName}/soil.bmp`);
        this.load.json(`object-data-${mapName}`, `assets/maps/parts/${mapName}/objects.json`);
        this.load.start();
	}
}