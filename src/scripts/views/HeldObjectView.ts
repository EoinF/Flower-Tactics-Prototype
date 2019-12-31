import { HeldObjectController } from "../controllers/HeldObjectController";
import { GuiController } from "../controllers/GuiController";
import { withLatestFrom, filter, map } from "rxjs/operators";
import { MapController } from "../controllers/MapController";
import { gameStateManager } from "../game";

export class HeldObjectView {
    constructor(scene: Phaser.Scene, heldObjectController: HeldObjectController, guiController: GuiController, mapController: MapController) {
        const heldCloudsWidget = scene.add.image(0, 0, 'cloud')
            .setVisible(false);
        const heldSeedWidget = scene.add.sprite(0, 0, 'seed2')
            .setVisible(false);

        guiController.endTurnObservable().subscribe(() => {
            heldObjectController.dropObject();
        });
        
        scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            guiController.setMousePosition(pointer.x, pointer.y);
        });
        
        heldObjectController.heldObjectObservable().subscribe(heldObject => {
            heldCloudsWidget.setVisible(false);
            heldSeedWidget.setVisible(false);
            if (heldObject != null) {
                if (heldObject.type === 'CLOUD') {
                    heldCloudsWidget.setVisible(true);
                } else if (heldObject.type === 'SEED') {
                    heldSeedWidget.setVisible(true);
                }
            }
        })
        mapController.mouseOverTileObservable()
            .pipe(
                withLatestFrom(mapController.cameraObservable(), gameStateManager.nextStateObservable())
            )
            .subscribe(([tile, mapCamera, state]) => {
                if (tile != null) {
                    const x = 48 * (tile.index % state.numTilesX) - mapCamera.scrollX;
                    const y = 48 * (Math.floor(tile.index / state.numTilesX)) - mapCamera.scrollY;

                    heldCloudsWidget.setPosition(x, y);
                    heldSeedWidget.setPosition(x, y);
                }
            });
    }
}