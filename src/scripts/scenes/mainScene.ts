import { SoilColourConverter } from "../SoilColourConverter";
import { MapLoader } from "../../MapLoader";
import objectData from '../../assets/maps/objects.json';
import { MapView } from "../views/MapView";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' })
  }

  create() {
    const soilColourConverter = new SoilColourConverter();
    const mapLoader = new MapLoader(soilColourConverter);

    const imageData = this.getMapImageData();
    const gameState = mapLoader.loadMap(imageData, objectData);
    
    const mapView = new MapView(this, gameState, soilColourConverter);
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
