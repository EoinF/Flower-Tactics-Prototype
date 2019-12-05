import { GameStateManager } from "../controllers/GameStateManager";
import { Tile } from "../objects/Tile";
import { SelectedObjectController } from "../controllers/SelectedObjectController";
import { UIContainer } from "../widgets/UIContainer";
import { ImageButton } from "../widgets/ImageButton";
import { COLOURS } from "../widgets/constants";
import { RadioButtonGroup } from "../widgets/RadioButtonGroup";
import { combineLatest } from "rxjs";
import { GameState } from "../objects/GameState";
import { TextLabel } from "../widgets/TextLabel";
import { FlexUIContainer } from "../widgets/FlexUIContainer";
import { NumberPointDisplay } from "../widgets/NumberDisplay/NumberPointDisplay";

export class SelectedTileView {
    x: number;
    y: number;
    width: number;
    height: number;

    private popup: UIContainer;
    private popupText: TextLabel;
    
    private nitrogenDisplay: NumberPointDisplay;
    private phosphorousDisplay: NumberPointDisplay;
    private potassiumDisplay: NumberPointDisplay;

    private tabGroup: RadioButtonGroup;
    private npkTab: ImageButton;
    private flowerTab: ImageButton;

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
        
        this.npkTab = new ImageButton(scene, 2, 2, 'button-npk')
            .setBackground(COLOURS.PURPLE_200, COLOURS.PURPLE_400, COLOURS.WHITE, COLOURS.PURPLE_500)
            .setBorder(1, COLOURS.GRAY);
        this.flowerTab = new ImageButton(scene, 4 + this.npkTab.width, 2, 'button-flower')
            .setBackground(COLOURS.PURPLE_200, COLOURS.PURPLE_400, COLOURS.WHITE, COLOURS.PURPLE_500)
            .setBorder(1, COLOURS.GRAY);

        this.tabGroup = new RadioButtonGroup([this.npkTab, this.flowerTab])
            .onChange((index) => {
                SelectedObjectController.setActiveTabIndex(index);
            });

        const displayHeight = 16;
        const displayWidth = 250;
        const displayIndent = 10;

        this.popupText = new TextLabel(scene, 8, 8, "...", COLOURS.BLACK, true);
        const popupContent = new FlexUIContainer(scene, 0, this.popupText.height + 16, this.popup.width, "grow");

        // Labels
        const nitrogenLabel = new TextLabel(scene, 4, 0, "Nitrogen: ", COLOURS.BLACK, false, 12);
        const phosphorousLabel = new TextLabel(scene, 4, 0, "Phosphorous: ", COLOURS.BLACK, false, 12);
        const potassiumLabel = new TextLabel(scene, 4, 0, "Potassium: ", COLOURS.BLACK, false, 12);

        const labelColumnWidth = Math.max(nitrogenLabel.width, phosphorousLabel.width, potassiumLabel.width);

        // Nitrogen section
        this.nitrogenDisplay = new NumberPointDisplay(scene, 2 + labelColumnWidth, 2, displayWidth, displayHeight,
            COLOURS.WHITE, COLOURS.BLACK,
            { startLabelText: "0%", endLabelText: "30%" },
            { min: 0, max: 30 }
        );
        const nitrogenSection = new UIContainer(scene, displayIndent, 0, labelColumnWidth + displayWidth + 4, displayHeight);
        nitrogenSection.addChild(nitrogenLabel, "Middle");
        nitrogenSection.addChild(this.nitrogenDisplay, "Middle");

        // Phosphorous section
        this.phosphorousDisplay = new NumberPointDisplay(scene, 2 + labelColumnWidth, 2, displayWidth, displayHeight,
            COLOURS.GREEN, COLOURS.RED,
            { startLabelText: "0%", endLabelText: "30%" },
            { min: 0, max: 30 }
        );
        const phosphorousSection = new UIContainer(scene, displayIndent, 2, labelColumnWidth + displayWidth + 4, displayHeight);
        phosphorousSection.addChild(phosphorousLabel, "Middle");
        phosphorousSection.addChild(this.phosphorousDisplay, "Middle");

        // Potassium section
        this.potassiumDisplay = new NumberPointDisplay(scene, 2 + labelColumnWidth, 2, displayWidth, displayHeight,
            COLOURS.GRAY, COLOURS.BLUE,
            { startLabelText: "0%", endLabelText: "30%" },
            { min: 0, max: 30 }
        );
        const potassiumSection = new UIContainer(scene, displayIndent, 0, labelColumnWidth + displayWidth + 4, displayHeight);
        potassiumSection.addChild(potassiumLabel, "Middle");
        potassiumSection.addChild(this.potassiumDisplay, "Middle");

        popupContent.addChild(nitrogenSection);
        popupContent.addChild(phosphorousSection);
        popupContent.addChild(potassiumSection);

        this.popup.addChild(this.popupText);
        this.popup.addChild(popupContent);
        this.popup.addChild(this.npkTab, "Top", "Right");
        this.popup.addChild(this.flowerTab, "Top", "Right");

        combineLatest(gameStateManager.nextStateObservable(),
            SelectedObjectController.selectedTileObservable(),
            SelectedObjectController.activeTabObservable()
        ).subscribe(([newState, activeTile, activeTab]) => {
            if (activeTile != null) {
                this.popup.setVisible(true);
                const tile = newState.getTileAt(activeTile.x, activeTile.y)!;
                this.updatePopupText(newState, tile, activeTab);
            } else {
                this.popup.setVisible(false);
            }
        });
    }

    private updatePopupText(gameState: GameState, tile: Tile, activeTab: number) {
        if (activeTab == 0) {
            this.setSoilText(gameState, tile);
        } else {
            this.setFlowerText(gameState, tile);
        }
    }

    private setSoilText(gameState: GameState, tile: Tile) {
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

        this.popupText.setText(titleText);
    }
    
    private setFlowerText(gameState: GameState, tile: Tile) {
        const flowers = gameState.getFlowersAtTile(tile);
        let titleText = "Plains";
        if (gameState.getRiverAtTile(tile) != null) {
            titleText = "River";
        } else if (gameState.getMountainAtTile(tile) != null) {
            titleText = "Mountains";
        }

        const flowerTypesMap = gameState.flowerTypes;
        
        let lines = [
            titleText,
            ...flowers.map(flower => `${flowerTypesMap[flower.type].name}: ${flower.amount}%`)
        ];

        this.popupText.setText(lines);
    }
}