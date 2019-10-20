import { GameStateManager } from "../GameStateManager";

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
        this.popupText = scene.add.text(0, 0, "hello world")
            .setColor("#000")
            .setDepth(2)
            .setOrigin(0.5, 0.5)
            .setVisible(false);

        this.gameStateManager.onChange((newState) =>{
            if (this.activeTileIndex != null) {
                const tile = newState.tiles[this.activeTileIndex];
                        
                const nitrogenContent = (tile.soil.nitrogenContent * 100).toFixed(2);
                const phosphorousContent = (tile.soil.phosphorousContent * 100).toFixed(2);
                const potassiumContent = (tile.soil.potassiumContent * 100).toFixed(2);
                this.popupText.setText(`N = ${nitrogenContent}%\nP = ${phosphorousContent}%\nK = ${potassiumContent}%`);
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
        
        const nitrogenContent = (tile.soil.nitrogenContent * 100).toFixed(2);
        const phosphorousContent = (tile.soil.phosphorousContent * 100).toFixed(2);
        const potassiumContent = (tile.soil.potassiumContent * 100).toFixed(2);
        this.popupText
            .setVisible(true)
            .setPosition(POPUP_OFFSET.x + x, POPUP_OFFSET.y + y)
            .setText(`N = ${nitrogenContent}%\nP = ${phosphorousContent}%\nK = ${potassiumContent}%`);
    }
}