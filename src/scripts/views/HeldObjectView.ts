import { HeldObjectController } from "../controllers/HeldObjectController";
import { GuiController } from "../controllers/GuiController";
import { withLatestFrom, filter, map } from "rxjs/operators";
import { MapController } from "../controllers/MapController";
import { gameStateController, gameActionController } from "../game";
import { HeldCloudsWidget } from "../widgets/specific/HeldCloudsWidget";
import { indexToMapCoordinates } from "../widgets/utils";
import { merge } from "rxjs";

export class HeldObjectView {
    constructor(scene: Phaser.Scene, heldObjectController: HeldObjectController, guiController: GuiController, mapController: MapController) {
        const heldCloudsWidget = new HeldCloudsWidget(scene, 0, 0);
        const heldSeedWidget = scene.add.sprite(0, 0, 'seed2')
            .setVisible(false);

        guiController.endTurnObservable().subscribe(() => {
            heldObjectController.dropObject();
        });
        
        scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            guiController.setMousePosition(pointer.x, pointer.y);
        });

        heldObjectController.heldObjectObservable().subscribe(heldObject => {
            heldSeedWidget.setVisible(false);
            heldCloudsWidget.setVisible(false);
            if (heldObject != null) {
                if (heldObject.type === 'SEED') {
                    heldSeedWidget.setVisible(true);
                } else if (heldObject.type === 'CLOUD') {
                    heldCloudsWidget.setVisible(true);
                }
            }
        });

        mapController.mouseOverTileObservable()
            .pipe(
                withLatestFrom(mapController.cameraObservable(), gameStateController.gameStateObservable())
            )
            .subscribe(([tile, mapCamera, state]) => {
                if (tile != null) {
                    const x = 48 * (tile.index % state.numTilesX) - mapCamera.scrollX;
                    const y = 48 * (Math.floor(tile.index / state.numTilesX)) - mapCamera.scrollY;

                    heldCloudsWidget.setAlpha(1);
                    heldCloudsWidget.setPosition(x, y);
                    heldSeedWidget.setPosition(x, y);
                } else {
                    const outsideOfView = -99999999;
                    heldSeedWidget.setPosition(outsideOfView, outsideOfView);
                }
            });
    }
}