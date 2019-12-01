import { GameStateManager } from "../controllers/GameStateManager";
import { Tile } from "../objects/Tile";
import { SelectedObjectController } from "../controllers/SelectedObjectController";
import { UIContainer } from "../widgets/UIContainer";
import { ImageButton } from "../widgets/ImageButton";
import { COLOURS } from "../widgets/constants";
import { RadioButtonGroup } from "../widgets/RadioButtonGroup";
import { combineLatest } from "rxjs";
import { filter } from "rxjs/operators";
import { GameState } from "../objects/GameState";
import { TextLabel } from "../widgets/TextLabel";
import { FlowerType } from "../objects/FlowerType";

export class SelectedFlowerTypeView {
    x: number;
    y: number;
    width: number;
    height: number;

    private popup: UIContainer;
    private popupText: TextLabel;

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

        this.popupText = new TextLabel(scene, 8, 8, "...", COLOURS.BLACK, true);
        
        this.popup.addChild(this.popupText);

        combineLatest(gameStateManager.nextStateObservable(),
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
        const nitrogenContent = (flowerTypeDetails.nitrogenRequirements.min).toFixed(2);
        const phosphorousContent = (flowerTypeDetails.phosphorousRequirements.min).toFixed(2);
        const potassiumContent = (flowerTypeDetails.potassiumRequirements.min).toFixed(2);
        
        let lines = [
            flowerTypeDetails.name,
            `N: ${nitrogenContent}%`,
            `P: ${phosphorousContent}%`,
            `K: ${potassiumContent}%`
        ];


        this.popupText.setText(lines);
    }
}