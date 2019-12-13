import { TextLabel } from "../../widgets/generic/TextLabel";
import { FlexUIContainer } from "../../widgets/generic/FlexUIContainer";
import { NumberPointDisplay } from "../../widgets/generic/NumberDisplay/NumberPointDisplay";
import { UIContainer } from "../../widgets/generic/UIContainer";
import { NITROGEN_VALUE_RANGE, POTASSIUM_VALUE_RANGE, PHOSPHOROUS_VALUE_RANGE, COLOURS } from "../../constants";
import { GameState } from "../../objects/GameState";
import { Tile } from "../../objects/Tile";
import { SelectedTileTab } from "./SelectedTileView";

export class SoilTab implements SelectedTileTab {
    private mainContainer: UIContainer;
    private titleText: TextLabel;
    
    private nitrogenDisplay: NumberPointDisplay;
    private phosphorousDisplay: NumberPointDisplay;
    private potassiumDisplay: NumberPointDisplay;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        const displayHeight = 16;
        const displayWidth = 250;
        const displayIndent = 10;

        this.titleText = new TextLabel(scene, 8, 8, "...", COLOURS.BLACK, {isBold: true});
        this.mainContainer = new FlexUIContainer(scene, x, y, this.titleText.width, "grow")
            .setVisible(false)
            .setDepth(4);

        // Labels
        const nitrogenLabel = new TextLabel(scene, 4, 0, "Nitrogen: ", COLOURS.BLACK, { fontSize: 12 });
        const phosphorousLabel = new TextLabel(scene, 4, 0, "Phosphorous: ", COLOURS.BLACK, { fontSize: 12 });
        const potassiumLabel = new TextLabel(scene, 4, 0, "Potassium: ", COLOURS.BLACK, { fontSize: 12 });

        const labelColumnWidth = Math.max(nitrogenLabel.width, phosphorousLabel.width, potassiumLabel.width);

        // Nitrogen section
        this.nitrogenDisplay = new NumberPointDisplay(scene, 2 + labelColumnWidth, 2, displayWidth, displayHeight,
            COLOURS.WHITE, COLOURS.BLACK,
            { startLabelText: "0%", endLabelText: "30%" },
            NITROGEN_VALUE_RANGE
        );
        const nitrogenSection = new UIContainer(scene, displayIndent, 0, labelColumnWidth + displayWidth + 4, displayHeight);
        nitrogenSection.addChild(nitrogenLabel, "Middle");
        nitrogenSection.addChild(this.nitrogenDisplay, "Middle");

        // Phosphorous section
        this.phosphorousDisplay = new NumberPointDisplay(scene, 2 + labelColumnWidth, 2, displayWidth, displayHeight,
            COLOURS.GREEN, COLOURS.RED,
            { startLabelText: "0%", endLabelText: "30%" },
            PHOSPHOROUS_VALUE_RANGE
        );
        const phosphorousSection = new UIContainer(scene, displayIndent, 2, labelColumnWidth + displayWidth + 4, displayHeight);
        phosphorousSection.addChild(phosphorousLabel, "Middle");
        phosphorousSection.addChild(this.phosphorousDisplay, "Middle");

        // Potassium section
        this.potassiumDisplay = new NumberPointDisplay(scene, 2 + labelColumnWidth, 2, displayWidth, displayHeight,
            COLOURS.GRAY, COLOURS.BLUE,
            { startLabelText: "0%", endLabelText: "30%" },
            POTASSIUM_VALUE_RANGE
        );
        const potassiumSection = new UIContainer(scene, displayIndent, 0, labelColumnWidth + displayWidth + 4, displayHeight);
        potassiumSection.addChild(potassiumLabel, "Middle");
        potassiumSection.addChild(this.potassiumDisplay, "Middle");

        this.mainContainer.addChild(this.titleText);
        this.mainContainer.addChild(nitrogenSection);
        this.mainContainer.addChild(phosphorousSection);
        this.mainContainer.addChild(potassiumSection);
    }
    
    show(gameState: GameState, tile: Tile) {
        this.mainContainer.setVisible(true);
        const { 
            nitrogenContent, 
            phosphorousContent,
            potassiumContent
        } = tile.soil;
        
        let titleText = "Plains";
        if (gameState.getRiverAtTile(tile) != null) {
            titleText = "River";
        } else if (gameState.getMountainAtTile(tile) != null) {
            titleText = "Mountains";
        }

        this.nitrogenDisplay.setValue(nitrogenContent);
        this.phosphorousDisplay.setValue(phosphorousContent);
        this.potassiumDisplay.setValue(potassiumContent);

        this.titleText.setText(titleText);
    }
    
    hide() {
        this.mainContainer.setVisible(false);
    }
}