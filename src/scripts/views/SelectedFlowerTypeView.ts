import { GameStateManager } from "../controllers/GameStateManager";
import { Tile } from "../objects/Tile";
import { SelectedObjectController } from "../controllers/SelectedObjectController";
import { UIContainer } from "../widgets/generic/UIContainer";
import { ImageButton } from "../widgets/generic/ImageButton";
import { COLOURS } from "../widgets/generic/constants";
import { RadioButtonGroup } from "../widgets/generic/RadioButtonGroup";
import { combineLatest } from "rxjs";
import { filter } from "rxjs/operators";
import { GameState } from "../objects/GameState";
import { TextLabel } from "../widgets/generic/TextLabel";
import { FlowerType } from "../objects/FlowerType";
import { NumberRangeDisplay } from "../widgets/generic/NumberDisplay/NumberRangeDisplay";
import { FlexUIContainer } from "../widgets/generic/FlexUIContainer";
import { POTASSIUM_VALUE_RANGE, NITROGEN_VALUE_RANGE, PHOSPHOROUS_VALUE_RANGE } from "../constants";

export class SelectedFlowerTypeView {
    x: number;
    y: number;
    width: number;
    height: number;

    private popup: UIContainer;
    private popupText: TextLabel;
    private nitrogenDisplay: NumberRangeDisplay;
    private phosphorousDisplay: NumberRangeDisplay;
    private potassiumDisplay: NumberRangeDisplay;

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

        const displayHeight = 16;
        const displayWidth = 250;
        const displayIndent = 10;

        const popupContent = new FlexUIContainer(scene, 0, 0, this.popup.width, "grow");
        this.popupText = new TextLabel(scene, 8, 8, "...", COLOURS.BLACK, true);

        // Labels
        const nitrogenLabel = new TextLabel(scene, 4, 0, "Nitrogen: ", COLOURS.BLACK, false, 12);
        const phosphorousLabel = new TextLabel(scene, 4, 0, "Phosphorous: ", COLOURS.BLACK, false, 12);
        const potassiumLabel = new TextLabel(scene, 4, 0, "Potassium: ", COLOURS.BLACK, false, 12);

        const labelColumnWidth = Math.max(nitrogenLabel.width, phosphorousLabel.width, potassiumLabel.width);

        // Nitrogen section
        this.nitrogenDisplay = new NumberRangeDisplay(scene, 2 + labelColumnWidth, 2, displayWidth, displayHeight,
            COLOURS.WHITE, COLOURS.BLACK,
            { startLabelText: "0%", endLabelText: "30%" },
            NITROGEN_VALUE_RANGE
        );
        const nitrogenSection = new UIContainer(scene, displayIndent, 0, labelColumnWidth + displayWidth + 4, displayHeight);
        nitrogenSection.addChild(nitrogenLabel, "Middle");
        nitrogenSection.addChild(this.nitrogenDisplay, "Middle");

        // Phosphorous section
        this.phosphorousDisplay = new NumberRangeDisplay(scene, 2 + labelColumnWidth, 2, displayWidth, displayHeight,
            COLOURS.GREEN, COLOURS.RED,
            { startLabelText: "0%", endLabelText: "30%" },
            PHOSPHOROUS_VALUE_RANGE
        );
        const phosphorousSection = new UIContainer(scene, displayIndent, 2, labelColumnWidth + displayWidth + 4, displayHeight);
        phosphorousSection.addChild(phosphorousLabel, "Middle");
        phosphorousSection.addChild(this.phosphorousDisplay, "Middle");

        // Potassium section
        this.potassiumDisplay = new NumberRangeDisplay(scene, 2 + labelColumnWidth, 2, displayWidth, displayHeight,
            COLOURS.GRAY, COLOURS.BLUE,
            { startLabelText: "0%", endLabelText: "30%" },
            POTASSIUM_VALUE_RANGE
        );
        const potassiumSection = new UIContainer(scene, displayIndent, 0, labelColumnWidth + displayWidth + 4, displayHeight);
        potassiumSection.addChild(potassiumLabel, "Middle");
        potassiumSection.addChild(this.potassiumDisplay, "Middle");

        popupContent.addChild(this.popupText);
        popupContent.addChild(nitrogenSection);
        popupContent.addChild(phosphorousSection);
        popupContent.addChild(potassiumSection);

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
        this.nitrogenDisplay.setValues(flowerTypeDetails.nitrogenRequirements);
        this.phosphorousDisplay.setValues(flowerTypeDetails.phosphorousRequirements);
        this.potassiumDisplay.setValues(flowerTypeDetails.potassiumRequirements);
        
        this.popupText.setText(flowerTypeDetails.name + "  -  Soil Requirements");
        // this.popup.setText(flowerTypeDetails.name + "  -  Soil Requirements");
    }
}