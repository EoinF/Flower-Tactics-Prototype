import { SoilColourConverter } from "../SoilColourConverter";
import { MapView } from "../views/MapView";
import { gameStateManager, selectedObjectController, seedController, mapController, guiController } from "../game";
import { TileStatsView } from "../views/TileStatsView";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' })
  }

  create() {
    const soilColourConverter = new SoilColourConverter();
    const mapView = new MapView(this, gameStateManager, soilColourConverter, selectedObjectController, seedController, mapController);
    const tileStatsView = new TileStatsView(this, selectedObjectController);
    mapController.setCamera(this.cameras.main);

		guiController.messagePromptObservable().subscribe(messagePrompt => {
			if (messagePrompt == null) {
				this.scene.resume();
			} else {
				this.scene.pause();
			}
		});
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
