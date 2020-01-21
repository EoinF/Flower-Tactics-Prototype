import { HeldObjectController } from "../controllers/HeldObjectController";
import { GuiController } from "../controllers/GuiController";
import { withLatestFrom, filter, map } from "rxjs/operators";
import { MapController } from "../controllers/MapController";
import { gameStateController } from "../game";
import { HeldCloudsWidget } from "../widgets/specific/HeldCloudsWidget";
import { COLOURS } from "../constants";
import { combineLatest } from "rxjs";
import { getPlayerColour } from "../widgets/utils";

export class HeldObjectView {
    constructor(scene: Phaser.Scene, heldObjectController: HeldObjectController, guiController: GuiController, mapController: MapController) {
        const heldCloudsWidget = new HeldCloudsWidget(scene, 0, 0, COLOURS.BLACK);
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

        gameStateController.currentPlayerObservable().subscribe(playerId => {
            heldCloudsWidget.setPlayerColour(getPlayerColour(playerId));
            heldSeedWidget.setTint(getPlayerColour(playerId).color);
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
                    heldCloudsWidget.setPosition(x - 24, y - 24);
                    heldSeedWidget.setPosition(x, y);
                } else {
                    const outsideOfView = -99999999;
                    heldSeedWidget.setPosition(outsideOfView, outsideOfView);
                }
            });
    }
}