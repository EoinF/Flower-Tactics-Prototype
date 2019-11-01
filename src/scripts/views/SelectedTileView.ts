import { GameStateManager } from "../GameStateManager";
import { Tile } from "../objects/Tile";
import { Flower } from "../objects/Flower";
import { SelectedTileController } from "../controllers/SelectedTileController";

const POPUP_OFFSET = {
    x: 8,
    y: -8
}

export class SelectedTileView {
    private popupImage: Phaser.GameObjects.Rectangle;
    private popupText: Phaser.GameObjects.Text;
    private gameStateManager: GameStateManager;
    private activeTileIndex?: number;

    constructor(scene: Phaser.Scene, gameStateManager: GameStateManager, selectedTileController: SelectedTileController) {
        this.gameStateManager = gameStateManager;
        const {
            width, height
        } = scene.game.canvas;

        this.popupImage = new Phaser.GameObjects.Rectangle(scene, 0, 0, 412, 96, 0xccaaff, 1)
            .setStrokeStyle(1, 0x1a0033)
            .setOrigin(0, 0)
            .setDepth(2)
            .setVisible(false);
        const container = scene.add.container(POPUP_OFFSET.x, height + POPUP_OFFSET.y, this.popupImage);
        container.setSize(this.popupImage.width, this.popupImage.height);
        console.log(container.width, container.height);
        container.setPosition(container.x, container.y - container.height);

        this.popupText = new Phaser.GameObjects.Text(scene, 8, 8, "...", { fontFamily: 'Verdana, "Times New Roman", Tahoma, serif', fontStyle: 'bold' })
            .setColor("#000")
            .setDepth(2)
            .setVisible(false);
        
        container.add(this.popupText);

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
        
        this.popupImage
            .setVisible(true)
        this.popupText
            .setVisible(true)
        this.updatePopupText(tile, this.gameStateManager.gameState.getFlowersAtTile(tile));
    }

    private updatePopupText(tile: Tile, flowers: Flower[]) {
        const nitrogenContent = (tile.soil.nitrogenContent).toFixed(2);
        const phosphorousContent = (tile.soil.phosphorousContent).toFixed(2);
        const potassiumContent = (tile.soil.potassiumContent).toFixed(2);
        
        let titleText = "Plains";
        if (flowers.length > 0) {
            titleText = "Flowers";
            // ...flowers.map(flower => `${this.gameStateManager.gameState.getFlowerType(flower).name}: ${flower.amount}%`),
        }
        
        let lines = [
            titleText,
            `N|P|K :   ${nitrogenContent}% | ${phosphorousContent}% | ${potassiumContent}%`
        ];

        this.popupText.setText(lines);
    }
}