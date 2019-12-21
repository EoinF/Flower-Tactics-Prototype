import { GameStateManager } from "../controllers/GameStateManager";
import { SelectedObjectController } from "../controllers/SelectedObjectController";
import { UIContainer } from "../widgets/generic/UIContainer";
import { combineLatest } from "rxjs";
import { GameState } from "../objects/GameState";
import { TextLabel } from "../widgets/generic/TextLabel";
import { FlowerType } from "../objects/FlowerType";
import { NumberRangeDisplay } from "../widgets/generic/NumberDisplay/NumberRangeDisplay";
import { FlexUIContainer } from "../widgets/generic/FlexUIContainer";
import { POTASSIUM_VALUE_RANGE, NITROGEN_VALUE_RANGE, PHOSPHOROUS_VALUE_RANGE, COLOURS } from "../constants";
import { FlowerStatsDisplay } from "../widgets/specific/FlowerStatsDisplay";

export class SelectedFlowerTypeView {
    x: number;
    y: number;
    width: number;
    height: number;

    private popup: UIContainer;
    private popupText: TextLabel;
    private flowerStatsDisplay: FlowerStatsDisplay;

    constructor(scene: Phaser.Scene, gameStateManager: GameStateManager, SelectedObjectController: SelectedObjectController) {

        this.popup = new UIContainer(scene, 8, 8, 412, 96, "Bottom")
            .setVisible(false)
            .setInteractive()
            .setDepth(2)
            .setBackground(COLOURS.PURPLE_100)
            .setBorder(1, COLOURS.PURPLE_700);

        this.x = this.popup.x;
        this.y = this.popup.y;
        this.width = this.popup.width;
        this.height = this.popup.height;

        const popupContent = new FlexUIContainer(scene, 0, 0, this.popup.width, "grow");
        this.popupText = new TextLabel(scene, 8, 8, "...", COLOURS.BLACK, {isBold: true});

        this.flowerStatsDisplay = new FlowerStatsDisplay(scene, 10, 0, 250, 16);

        popupContent.addChild(this.popupText);
        popupContent.addChild(this.flowerStatsDisplay);

        this.popup.addChild(popupContent);

        combineLatest(
            gameStateManager.nextStateObservable(),
            SelectedObjectController.selectedFlowerTypeObservable()
        )
        .subscribe(([newState, selectedFlowerType]) => {
            if (selectedFlowerType != null) {
                this.popup.setVisible(true);
                const flowerTypeDetails = newState.flowerTypes[selectedFlowerType]!;
                this.updatePopupText(newState, flowerTypeDetails);
            } else {
                this.popup.setVisible(false);
            }
        });
    }

    private updatePopupText(gameState: GameState, flowerTypeDetails: FlowerType) {
        this.flowerStatsDisplay.setValues(flowerTypeDetails);
        
        this.popupText.setText(flowerTypeDetails.name + "  -  Soil Requirements");
    }
}