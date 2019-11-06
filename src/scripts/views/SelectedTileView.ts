import { GameStateManager } from "../GameStateManager";
import { Tile } from "../objects/Tile";
import { Flower } from "../objects/Flower";
import { SelectedTileController } from "../controllers/SelectedTileController";
import { UIContainer } from "../widgets/UIContainer";
import { ImageButton } from "../widgets/ImageButton";
import { COLOURS } from "../widgets/constants";
import { RadioButtonGroup } from "../widgets/RadioButtonGroup";
import { BaseUIObject } from "../widgets/BaseUIObject";

export class SelectedTileView implements BaseUIObject {
    x: number;
    y: number;
    width: number;
    height: number;

    setPosition(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.popup.setPosition(x, y);
        return this;
    };
    setVisible (isVisible: boolean) {
        this.popup.setVisible(isVisible);
        return this;
    }
    setDepth (depth: number) {
        this.popup.setDepth(depth);
        return this;
    }

    destroy() {
        this.popup.destroy();
    }

    private popup: UIContainer;
    private popupText: Phaser.GameObjects.Text;

    private tabGroup: RadioButtonGroup;
    private npkTab: ImageButton;
    private flowerTab: ImageButton;

    private gameStateManager: GameStateManager;
    private activeTileIndex?: number;

    constructor(scene: Phaser.Scene, gameStateManager: GameStateManager, selectedTileController: SelectedTileController) {
        this.gameStateManager = gameStateManager;

        this.popup = new UIContainer(scene, 8, 8, 412, 96, "Bottom")
            .setVisible(false)
            .setDepth(2)
            .setBackground(COLOURS.PURPLE_100)
            .setBorder(1, COLOURS.PURPLE_700);

        this.x = this.popup.x;
        this.y = this.popup.y;
        this.width = this.popup.width;
        this.height = this.popup.height;

        this.popupText = scene.add.text(8, 8, "...", { fontFamily: 'Verdana, "Times New Roman", Tahoma, serif', fontStyle: 'bold' })
            .setColor("#000");
        
        this.npkTab = new ImageButton(scene, 2, 2, 'button-npk')
            .setBackground(COLOURS.PURPLE_200, COLOURS.PURPLE_400, COLOURS.WHITE, COLOURS.PURPLE_500)
            .setBorder(1, COLOURS.GRAY);
        this.flowerTab = new ImageButton(scene, 4 + this.npkTab.width, 2, 'button-flower')
            .setBackground(COLOURS.PURPLE_200, COLOURS.PURPLE_400, COLOURS.WHITE, COLOURS.PURPLE_500)
            .setBorder(1, COLOURS.GRAY);

        this.tabGroup = new RadioButtonGroup([this.npkTab, this.flowerTab])
            .onChange(() => {
                if (this.activeTileIndex != null) {
                    const tile = this.gameStateManager.gameState.tiles[this.activeTileIndex];
                    this.updatePopupText(tile, this.gameStateManager.gameState.getFlowersAtTile(tile));
                }
            })
        
        this.popup.addChild(this.popupText);
        this.popup.addChild(this.npkTab, "Top", "Right");
        this.popup.addChild(this.flowerTab, "Top", "Right");

        gameStateManager.onChange((newState) => {
            if (this.activeTileIndex != null) {
                const tile = newState.tiles[this.activeTileIndex];
                this.updatePopupText(tile, newState.getFlowersAtTile(tile));
            }
        });
        selectedTileController.onChange((x, y) => {
            this.onSetActiveTile(x, y);
        })
    }

    private onSetActiveTile(tileX: number, tileY: number) {
        this.activeTileIndex = tileX + tileY * this.gameStateManager.gameState.numTilesX;

        const tile = this.gameStateManager.gameState.tiles[this.activeTileIndex];
        
        this.popup.setVisible(true);

        this.updatePopupText(tile, this.gameStateManager.gameState.getFlowersAtTile(tile));
    }

    private updatePopupText(tile: Tile, flowers: Flower[]) {
        if (this.tabGroup.selectedButtonIndex == 0) {
            this.setSoilText(tile, flowers);
        } else {
            this.setFlowerText(tile, flowers);
        }
    }

    private setSoilText(tile: Tile, flowers: Flower[]) {
        const nitrogenContent = (tile.soil.nitrogenContent).toFixed(2);
        const phosphorousContent = (tile.soil.phosphorousContent).toFixed(2);
        const potassiumContent = (tile.soil.potassiumContent).toFixed(2);
        
        let titleText = "Plains";
        if (this.gameStateManager.gameState.getRiverAtTile(tile) != null) {
            titleText = "River";
        } else if (this.gameStateManager.gameState.getMountainAtTile(tile) != null) {
            titleText = "Mountains";
        }
        
        let lines = [
            titleText,
            `N|P|K :   ${nitrogenContent}% | ${phosphorousContent}% | ${potassiumContent}%`
        ];

        this.popupText.setText(lines);
    }
    
    private setFlowerText(tile: Tile, flowers: Flower[]) {
        
        let titleText = "Plains";
        if (this.gameStateManager.gameState.getRiverAtTile(tile) != null) {
            titleText = "River";
        } else if (this.gameStateManager.gameState.getMountainAtTile(tile) != null) {
            titleText = "Mountains";
        }

        const flowerTypesMap = this.gameStateManager.gameState.flowerTypes;
        
        let lines = [
            titleText,
            ...flowers.map(flower => `${flowerTypesMap[flower.type].name}: ${flower.amount}%`)
        ];

        this.popupText.setText(lines);
    }
}