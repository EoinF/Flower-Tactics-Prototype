import { ImageButton } from "../widgets/generic/ImageButton";
import { COLOURS } from "../constants";
import { HeldObjectController } from "../controllers/HeldObjectController";
import { GuiController } from "../controllers/GuiController";
import { withLatestFrom } from "rxjs/operators";
import { combineLatest } from "rxjs";
import { GameStateController } from "../controllers/GameStateController";

export class CloudUIView {
    constructor(scene: Phaser.Scene, heldObjectController: HeldObjectController, guiController: GuiController, 
        gameStateController: GameStateController,
        x: number, y: number
    ) {
        const cloudPlacementButton = new ImageButton(scene, x, y, 'button-cloud', "auto", "auto", COLOURS.PURPLE_200,
            COLOURS.PURPLE_100, COLOURS.LIGHT_GRAY, COLOURS.WHITE,
            "Bottom", "Right"
        )
            .setBorder(1, COLOURS.BLACK)
            .onClick(() => guiController.clickCloudPlacementButton());
        
        combineLatest(
            gameStateController.gameStateObservable(),
            gameStateController.currentPlayerObservable()
        ).subscribe(([gameState, currentPlayerId]) => {
            cloudPlacementButton.setVisible(gameState.players[currentPlayerId].cloudOwned != null);
        })

        guiController.onClickCloudPlacementButtonObservable().pipe(
            withLatestFrom(heldObjectController.isHoldingCloudObservable())
        ).subscribe(([_, isHoldingCloud]) => {
            if (isHoldingCloud) {
                heldObjectController.dropObject();
            } else {
                heldObjectController.pickUpClouds()
            }
        });
   } 
}