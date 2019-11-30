import { GameStateManager } from "../controllers/GameStateManager";
import { Tile } from "../objects/Tile";
import { SelectedTileController } from "../controllers/SelectedTileController";
import { UIContainer } from "../widgets/UIContainer";
import { ImageButton } from "../widgets/ImageButton";
import { COLOURS } from "../widgets/constants";
import { RadioButtonGroup } from "../widgets/RadioButtonGroup";
import { combineLatest } from "rxjs";
import { filter } from "rxjs/operators";
import { GameState } from "../objects/GameState";
import { TextLabel } from "../widgets/TextLabel";

export class SelectedTileView {
    x: number;
    y: number;
    width: number;
    height: number;

    private popup: UIContainer;
    private popupText: TextLabel;

    private tabGroup: RadioButtonGroup;
    private npkTab: ImageButton;
    private flowerTab: ImageButton;

    constructor(scene: Phaser.Scene, gameStateManager: GameStateManager, selectedTileController: SelectedTileController) {
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
        
        this.npkTab = new ImageButton(scene, 2, 2, 'button-npk')
            .setBackground(COLOURS.PURPLE_200, COLOURS.PURPLE_400, COLOURS.WHITE, COLOURS.PURPLE_500)
            .setBorder(1, COLOURS.GRAY);
        this.flowerTab = new ImageButton(scene, 4 + this.npkTab.width, 2, 'button-flower')
            .setBackground(COLOURS.PURPLE_200, COLOURS.PURPLE_400, COLOURS.WHITE, COLOURS.PURPLE_500)
            .setBorder(1, COLOURS.GRAY);

        this.tabGroup = new RadioButtonGroup([this.npkTab, this.flowerTab])
            .onChange((index) => {
                selectedTileController.setActiveTabIndex(index);
            });
        
        this.popup.addChild(this.popupText);
        this.popup.addChild(this.npkTab, "Top", "Right");
        this.popup.addChild(this.flowerTab, "Top", "Right");

        combineLatest(gameStateManager.nextStateObservable(),
            selectedTileController.activeTileObservable(),
            selectedTileController.activeTabObservable())
            .pipe(
                filter(([newState, activeTile]) => activeTile != null)
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
        const nitrogenContent = (tile.soil.nitrogenContent).toFixed(2);
        const phosphorousContent = (tile.soil.phosphorousContent).toFixed(2);
        const potassiumContent = (tile.soil.potassiumContent).toFixed(2);
        
        let titleText = "Plains";
        if (gameState.getRiverAtTile(tile) != null) {
            titleText = "River";
        } else if (gameState.getMountainAtTile(tile) != null) {
            titleText = "Mountains";
        }
        
        let lines = [
            titleText,
            `N|P|K :   ${nitrogenContent}% | ${phosphorousContent}% | ${potassiumContent}%`
        ];

        this.popupText.setText(lines);
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