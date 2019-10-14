import { MapGenerator } from "../MapGenerator";
import { SoilColourConverter } from "../SoilColourConverter";
import { MapLoader } from "../../MapLoader";


export default class MainScene extends Phaser.Scene {

  constructor() {
    super({ key: 'MainScene' })
  }

  create() {
    const seed = 1;

    const soilColourConverter = new SoilColourConverter();

    const mapLoader = new MapLoader(soilColourConverter);

    const colour = new Phaser.Display.Color(255, 0, 0);
    const soil = soilColourConverter.colourToSoil(colour);
    const output = soilColourConverter.soilToColour(soil);

    const imageData = this.getMapImageData();
    const gameState = mapLoader.loadMap(imageData);
    console.log(gameState);
    
    const sprites = gameState.tiles.map((tile, index) => {
      const x = (index % gameState.numTilesX) * 48;
      const y = Math.floor(index / gameState.numTilesX) * 48;
      const img = this.add.image(x, y, 'blank-tile');
      return img.setTint(soilColourConverter.soilToColour(tile.soil).color);
    });
  }

  getMapImageData() {
    const frame = this.textures.getFrame('map1-soil');
    console.log(frame);
    const cnv = this.textures.createCanvas('temp', frame.width, frame.height);
    let ctx = cnv.getContext();
    ctx.clearRect(0, 0, frame.width, frame.height);
    ctx.drawImage(frame.source.image, 0, 0, frame.width, frame.height, 0, 0, frame.width, frame.height);
    const imageData = ctx.getImageData(0, 0, frame.width, frame.height);

    console.log(imageData);
    return imageData;
  }

  update() {
  }
}
//
