import { Tile } from "../objects/Tile";

const POPUP_OFFSET = {
    x: 0,
    y: -96
}

export class SelectedTileView {
    private highlightImage: Phaser.GameObjects.Rectangle;
    private popupImage: Phaser.GameObjects.Rectangle;
    private popupText: Phaser.GameObjects.Text;
    private activeTile: Tile;

    constructor(scene: Phaser.Scene) {
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
    }

    setActiveTile(tile: Tile, x: number, y: number) {
        this.activeTile = tile;
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