import { SoilColourConverter } from "../SoilColourConverter";
import { MapLoader, ObjectData } from "../MapLoader";
import { gameStateManager, guiController } from "../game";
import { MapGenerator } from "../MapGenerator";
import { MapSaver } from "../MapSaver";
import { GameStateData } from "../objects/GameState";
import { Tutorial1 } from "../tutorial/Tutorial1";
import { TutorialRunner } from "../tutorial/TutorialRunner";

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' })
  }

  preload() {
    this.load.image('blank-tile', 'assets/img/tile.png');
    this.load.image('flower', 'assets/img/flower.png');
    this.load.image('mountain', 'assets/img/mountain.png');
    this.load.image('river', 'assets/img/river.png');
    this.load.image('seed', 'assets/img/seed.png');
    this.load.image('seed2', 'assets/img/seed2.png');

    this.load.image('tile-allowed', 'assets/img/tile-allowed.png');
    this.load.image('tile-blocked', 'assets/img/tile-blocked.png');
    this.load.image('tile-viable', 'assets/img/tile-viable.png');

    this.load.image('button-npk', 'assets/img/button-npk.png');
    this.load.image('button-flower', 'assets/img/button-flower.png');
    this.load.image('button-info', 'assets/img/button-info.png');

    this.load.image('gui-arrow-left', 'assets/img/gui-arrow-left.png');
  }
  
  getMapImageData() {
    const frame = this.textures.getFrame('map1-soil');
    const cnv = this.textures.createCanvas('temp', frame.width, frame.height);
    let ctx = cnv.getContext();
    ctx.clearRect(0, 0, frame.width, frame.height);
    ctx.drawImage(frame.source.image, 0, 0, frame.width, frame.height, 0, 0, frame.width, frame.height);

    const imageData = ctx.getImageData(0, 0, frame.width, frame.height);
    return imageData;
  }

  create() {
    const soilColourConverter = new SoilColourConverter();
    const mapLoader = new MapLoader(soilColourConverter);
    const mapSaver = new MapSaver();

    const mapGenerator = new MapGenerator(1);

    this.load.on('complete', () => {
      console.log("complete");
      const imageData = this.getMapImageData();
      const objectData = this.cache.json.get('object-data') as ObjectData;
      const initialState = mapLoader.loadMap(imageData, objectData);

      mapSaver.saveMap(initialState);
      this.onReady(initialState);
    }, this)

    const mapName = "tutorial1";

    this.load.image('map1-soil', `assets/maps/parts/${mapName}/soil.bmp`);
    this.load.json('object-data', `assets/maps/parts/${mapName}/objects.json`);
    this.load.start();
  }

  onReady(initialState: GameStateData) {
    // gameStateManager.setState(mapGenerator.generateNewMap({numTilesX: 100, numTilesY: 100}));
    gameStateManager.setState(initialState);

    this.scene.start('MainScene')
    this.scene.start('UIScene')

    /**
     * This is how you would dynamically import the mainScene class (with code splitting),
     * add the mainScene to the Scene Manager
     * and start the scene.
     * The name of the chunk would be 'mainScene.chunk.js
     * Find more about code splitting here: https://webpack.js.org/guides/code-splitting/
     */
    // let someCondition = true
    // if (someCondition)
    //   import(/* webpackChunkName: "mainScene" */ './mainScene').then(mainScene => {
    //     this.scene.add('MainScene', mainScene.default, true)
    //   })
    // else console.log('The mainScene class will not even be loaded by the browser')
  }
}
