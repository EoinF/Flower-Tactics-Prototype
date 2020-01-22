import { TextButton } from "../widgets/generic/TextButton"
import { COLOURS } from "../constants";
import { GameStateData } from "../objects/GameState";
import { gameStateController, guiController, mapController, mainMenuController } from "../game";
import { TextLabel } from "../widgets/generic/TextLabel";
import { Observable, Subject, of, forkJoin, combineLatest } from "rxjs";
import { MapLoader, ObjectData } from "../MapLoader";
import { MapSaver } from "../MapSaver";
import { TutorialRunner } from "../tutorial/TutorialRunner";
import { SoilColourConverter } from "../SoilColourConverter";
import { Tutorial1 } from "../tutorial/Tutorial1";
import { flatMap, filter, mapTo, startWith, tap } from "rxjs/operators";
import { LevelSelectView } from "../views/MainMenu/LevelSelectView";

export default class MainMenuScene extends Phaser.Scene {
    
    constructor() {
		super({ key: 'MainMenuScene' })
    }

    create() {
        this.scene.launch("PreloadScene");
        new LevelSelectView(this, mainMenuController);

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
            filter(([levelName, isAssetsLoaded]) => isAssetsLoaded),
            flatMap(([levelName]) => {
                mainMenuController.setLoadState("LOADING_MAP_DATA");
                return this.loadMap(levelName)
            })
        ).subscribe((levelData) => {
		    gameStateController.loadGame(levelData);
        });

        gameStateController.loadMapObservable().subscribe(() => {
            this.scene.start('MainScene');
            this.scene.start('UIScene');
            this.scene.start('EvolveSeedScene');
            this.scene.start('OverlayScene');
        })
    }

	getMapImageData() {
		const frame = this.textures.getFrame('map-soil');
		const cnv = this.textures.createCanvas('temp' + Math.random(), frame.width, frame.height);
		let ctx = cnv.getContext();
		ctx.clearRect(0, 0, frame.width, frame.height);
		ctx.drawImage(frame.source.image, 0, 0, frame.width, frame.height, 0, 0, frame.width, frame.height);

		const imageData = ctx.getImageData(0, 0, frame.width, frame.height);
		return imageData;
	}
    
	loadMap(mapName: string): Observable<GameStateData> {
        const onLoadMap$ = new Subject<GameStateData>();
        try {
            const soilColourConverter = new SoilColourConverter();
            const tutorialRunner = new TutorialRunner(guiController, mapController, gameStateController)
            const mapLoader = new MapLoader(soilColourConverter);
            const mapSaver = new MapSaver();
            // const mapGenerator = new MapGenerator(1);

            this.load.on('complete', () => {
                try {
                    const imageData = this.getMapImageData();
                    const objectData = this.cache.json.get('object-data') as ObjectData;
                    const initialState = mapLoader.loadMap(imageData, objectData);
                    
                    if (mapName === "tutorial1") {
                        tutorialRunner.runTutorial(new Tutorial1());
                    }

                    // mapSaver.saveMap(initialState);
                    onLoadMap$.next(initialState);
                } catch(err) {
                    onLoadMap$.error(err);
                }
            }, this)

            this.load.image('map-soil', `assets/maps/parts/${mapName}/soil.bmp`);
            this.load.json('object-data', `assets/maps/parts/${mapName}/objects.json`);
            this.load.start();
        } catch (err) {
            onLoadMap$.error(err);
        }
		return onLoadMap$;
	}
}