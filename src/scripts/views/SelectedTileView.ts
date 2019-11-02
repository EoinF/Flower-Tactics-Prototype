import { GameStateManager } from "../GameStateManager";
import { Tile } from "../objects/Tile";
import { Flower } from "../objects/Flower";
import { SelectedTileController } from "../controllers/SelectedTileController";
import { UIContainer } from "../widgets/UIContainer";

const POPUP_OFFSET = {
    x: 8,
    y: -8
}

export class SelectedTileView {
    private popup: UIContainer;
    private popupText: Phaser.GameObjects.Text;
    private gameStateManager: GameStateManager;
    private activeTileIndex?: number;

    constructor(scene: Phaser.Scene, gameStateManager: GameStateManager, selectedTileController: SelectedTileController) {
        this.gameStateManager = gameStateManager;

        this.popup = new UIContainer(scene, 8, 8, 412, 96, "Bottom")
            .setVisible(false);

        this.popupText = new Phaser.GameObjects.Text(scene, 8, 8, "...", { fontFamily: 'Verdana, "Times New Roman", Tahoma, serif', fontStyle: 'bold' })
            .setColor("#000")
            .setDepth(2)
            .setVisible(false);
        
        this.popup.addChild(this.popupText);

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
        this.popupText.setVisible(true);

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