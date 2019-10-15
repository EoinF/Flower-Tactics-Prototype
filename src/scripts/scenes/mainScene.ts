import { SoilColourConverter } from "../SoilColourConverter";
import { MapLoader } from "../../MapLoader";
import { Tile } from "../objects/Tile";


export default class MainScene extends Phaser.Scene {
  activeTile?: Tile;
  highlightImage?: Phaser.GameObjects.Rectangle;
  constructor() {
    super({ key: 'MainScene' })
  }

  create() {
    const soilColourConverter = new SoilColourConverter();
    const mapLoader = new MapLoader(soilColourConverter);

    const imageData = this.getMapImageData();
    const gameState = mapLoader.loadMap(imageData);
    
    const sprites = gameState.tiles.map((tile, index) => {
      const x = (index % gameState.numTilesX) * 48;
      const y = Math.floor(index / gameState.numTilesX) * 48;
      const img = this.add.image(x, y, 'blank-tile');
      img.setTint(soilColourConverter.soilToColour(tile.soil).color);
      img.setInteractive().on('pointerup', () => {
        if (this.highlightImage != null) {
          this.highlightImage.destroy();
        }
        this.activeTile = tile;
        this.highlightImage = this.add.rectangle(x, y, 48, 48, 0x4c00ff, 0.3);
        this.highlightImage.setStrokeStyle(2, 0x4c00ff);
      });
      return img;
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
    const CAMERA_SPEED = 15;
    const cursors = this.input.keyboard.createCursorKeys();
    if (cursors.left && cursors.left.isDown) {
      this.cameras.main.scrollX -= CAMERA_SPEED;
    } else if (cursors.right && cursors.right.isDown) {
      this.cameras.main.scrollX += CAMERA_SPEED;
    }
    if (cursors.down && cursors.down.isDown) {
      this.cameras.main.scrollY += CAMERA_SPEED;
    } else if (cursors.up && cursors.up.isDown) {
      this.cameras.main.scrollY -= CAMERA_SPEED;
    }
  }
}
