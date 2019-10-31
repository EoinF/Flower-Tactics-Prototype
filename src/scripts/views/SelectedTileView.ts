import { GameStateManager } from "../GameStateManager";
import { Tile } from "../objects/Tile";
import { Flower } from "../objects/Flower";

const POPUP_OFFSET = {
    x: 0,
    y: -96
}

export class SelectedTileView {
    private highlightImage: Phaser.GameObjects.Rectangle;
    private popupImage: Phaser.GameObjects.Rectangle;
    private popupText: Phaser.GameObjects.Text;
    private gameStateManager: GameStateManager;
    private activeTileIndex?: number;

    constructor(scene: Phaser.Scene, gameStateManager: GameStateManager) {
        this.gameStateManager = gameStateManager;
        this.highlightImage = scene.add.rectangle(0, 0, 48, 48, 0x4c00ff, 0.3)
            .setStrokeStyle(2, 0x4c00ff)
            .setDepth(1)
            .setVisible(false);
        this.popupImage = scene.add.rectangle(0, 0, 144, 72, 0xccaaff, 1)
            .setStrokeStyle(1, 0x1a0033)
            .setDepth(2)
            .setVisible(false);
        this.popupText = scene.add.text(0, 0, "...")
            .setColor("#000")
            .setDepth(2)
            .setOrigin(0.5, 0.5)
            .setVisible(false);

        this.gameStateManager.onChange((newState) => {
            if (this.activeTileIndex != null) {
                const tile = newState.tiles[this.activeTileIndex];
                this.updatePopupText(tile, newState.getFlowersAtTile(tile));
            }
        })
    }

    setActiveTile(tileX: number, tileY: number) {
        const x = tileX * 48;
        const y = tileY * 48;
        this.activeTileIndex = tileX + tileY * this.gameStateManager.gameState.numTilesX;

        const tile = this.gameStateManager.gameState.tiles[this.activeTileIndex];
        this.highlightImage
            .setVisible(true)
            .setPosition(x, y);
        this.popupImage
            .setVisible(true)
            .setPosition(POPUP_OFFSET.x + x, POPUP_OFFSET.y + y);
        

        this.popupText
            .setVisible(true)
            .setPosition(POPUP_OFFSET.x + x, POPUP_OFFSET.y + y);
        this.updatePopupText(tile, this.gameStateManager.gameState.getFlowersAtTile(tile));
    }

    updatePopupText(tile: Tile, flowers: Flower[]) {
        const nitrogenContent = (tile.soil.nitrogenContent).toFixed(2);
        const phosphorousContent = (tile.soil.phosphorousContent).toFixed(2);
        const potassiumContent = (tile.soil.potassiumContent).toFixed(2);
        
        let lines = [
            `N = ${nitrogenContent}%`,
            `P = ${phosphorousContent}%`,
            `K = ${potassiumContent}%`
        ];

        if (flowers.length > 0) {
            lines = [
                ...flowers.map(flower => `${this.gameStateManager.gameState.getFlowerType(flower).name}: ${flower.amount}%`),
                ...lines
            ]
        }

        this.popupText.setText(lines);
    }
}