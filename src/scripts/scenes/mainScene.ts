import { SoilColourConverter } from "../SoilColourConverter";
import { MapView } from "../views/MapView";
import { gameStateManager, selectedObjectController, mapController, guiController, heldObjectController } from "../game";
import { TileStatsView } from "../views/TileStatsView";
import { combineLatest } from "rxjs";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' })
  }

  create() {
    const soilColourConverter = new SoilColourConverter();
    new MapView(this, gameStateManager, soilColourConverter, heldObjectController, mapController);
    new TileStatsView(this, selectedObjectController);
    mapController.setCamera(this.cameras.main);

    combineLatest(guiController.messagePromptObservable(), guiController.screenStateObservable())
      .subscribe(([messagePrompt, screenState]) => {
        if (messagePrompt != null || screenState != "In Game") {
          this.scene.pause();
        } else {
          this.scene.resume();
        }
    });

    const shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    shiftKey.on('down', () => {
      guiController.setIsHoldingShiftKey(true);
    })
    shiftKey.on('up', () => {
        guiController.setIsHoldingShiftKey(false);
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
