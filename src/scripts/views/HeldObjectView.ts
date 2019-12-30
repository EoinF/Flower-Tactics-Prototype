import { HeldObjectController } from "../controllers/HeldObjectController";
import { GuiController } from "../controllers/GuiController";
import { withLatestFrom } from "rxjs/operators";
import { MapController } from "../controllers/MapController";
import { gameStateManager } from "../game";

export class HeldObjectView {
    constructor(scene: Phaser.Scene, heldObjectController: HeldObjectController, guiController: GuiController, mapController: MapController) {
        const heldObjectWidget = scene.add.image(0, 0, 'cloud')
            .setVisible(false);

        
        scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            guiController.setMousePosition(pointer.x, pointer.y);
        });
        
        heldObjectController.heldObjectObservable().subscribe(heldObject => {
            if (heldObject === 'CLOUD') {
                heldObjectWidget.setVisible(true);
            } else {
                heldObjectWidget.setVisible(false);
            }
        })
        mapController.mouseOverTileObservable()
            .pipe(withLatestFrom(mapController.cameraObservable(), gameStateManager.nextStateObservable()))
            .subscribe(([tile, mapCamera, state]) => {
                if (tile != null) {
                    const x = 48 * (tile.index % state.numTilesX) - mapCamera.scrollX;
                    const y = 48 * (Math.floor(tile.index / state.numTilesX)) - mapCamera.scrollY;

                    heldObjectWidget.setPosition(x, y);
                }
            });
    }
}