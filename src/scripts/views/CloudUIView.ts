import { ImageButton } from "../widgets/generic/ImageButton";
import { COLOURS } from "../constants";
import { HeldObjectController } from "../controllers/HeldObjectController";
import { GuiController } from "../controllers/GuiController";
import { withLatestFrom } from "rxjs/operators";

export class CloudUIView {
    constructor(scene: Phaser.Scene, heldObjectController: HeldObjectController, guiController: GuiController, 
        x: number, y: number
    ) {
        const cloudPlacementButton = new ImageButton(scene, x, y, 'button-cloud', "auto", "auto", COLOURS.PURPLE_200,
            COLOURS.PURPLE_100, COLOURS.LIGHT_GRAY, COLOURS.WHITE,
            "Bottom", "Right"
        )
            .setBorder(1, COLOURS.BLACK)
            .onClick(() => guiController.clickCloudPlacementButton());

        guiController.onClickCloudPlacementButtonObservable()
            .pipe(
                withLatestFrom(heldObjectController.heldCloudObservable())
            ).subscribe(([_, heldObject]) => {
                if (heldObject != null) {
                    heldObjectController.dropObject();
                } else {
                    heldObjectController.pickUpClouds()
                }
        });
   } 
}