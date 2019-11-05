import { GameStateManager } from "../GameStateManager";
import { Tile } from "../objects/Tile";
import { Flower } from "../objects/Flower";
import { SelectedTileController } from "../controllers/SelectedTileController";
import { UIContainer } from "../widgets/UIContainer";
import { ImageButton } from "../widgets/ImageButton";
import { COLOURS } from "../widgets/constants";

export class SelectedTileView {
    private popup: UIContainer;
    private popupText: Phaser.GameObjects.Text;
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

        this.popupText = scene.add.text(8, 8, "...", { fontFamily: 'Verdana, "Times New Roman", Tahoma, serif', fontStyle: 'bold' })
            .setColor("#000");
        
        this.npkTab = new ImageButton(scene, 2, 2, 'button-npk')
            .setBackground(COLOURS.PURPLE_200, COLOURS.PURPLE_400, COLOURS.WHITE, COLOURS.PURPLE_500)
            .setBorder(1, COLOURS.BLACK);
        this.flowerTab = new ImageButton(scene, 4 + this.npkTab.width, 2, 'button-flower')
            .setBackground(COLOURS.PURPLE_200, COLOURS.PURPLE_400, COLOURS.WHITE, COLOURS.PURPLE_500)
            .setBorder(1, COLOURS.BLACK);
        
        this.popup.addChild(this.popupText);
        this.popup.addChild(this.npkTab, "Top", "Right");
        this.popup.addChild(this.flowerTab, "Top", "Right");

        this.flowerTab.onClick(() => {
            
        })
        this.npkTab.onClick(() => {
            
        })

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
        const nitrogenContent = (tile.soil.nitrogenContent).toFixed(2);
        const phosphorousContent = (tile.soil.phosphorousContent).toFixed(2);
        const potassiumContent = (tile.soil.potassiumContent).toFixed(2);
        
        let titleText = "Plains";
        if (this.gameStateManager.gameState.getRiverAtTile(tile) != null) {
            titleText = "River";
        } else if (this.gameStateManager.gameState.getMountainAtTile(tile) != null) {
            titleText = "Mountains";
        }
        if (flowers.length > 0) {
            // titleText = "Flowers";
            // ...flowers.map(flower => `${this.gameStateManager.gameState.getFlowerType(flower).name}: ${flower.amount}%`),
        }
        
        let lines = [
            titleText,
            `N|P|K :   ${nitrogenContent}% | ${phosphorousContent}% | ${potassiumContent}%`
        ];

        this.popupText.setText(lines);
    }
}