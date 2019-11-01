import { GameStateManager } from "../GameStateManager";
import { Tile } from "../objects/Tile";
import { Flower } from "../objects/Flower";
import { SelectedTileController } from "../controllers/SelectedTileController";

const POPUP_OFFSET = {
    x: 32,
    y: -32
}

export class TileStatsView {
    private highlightImage: Phaser.GameObjects.Rectangle;
    private selectedTileController: SelectedTileController;

    constructor(scene: Phaser.Scene, selectedTileController: SelectedTileController) {
        this.selectedTileController = selectedTileController;

        this.highlightImage = scene.add.rectangle(0, 0, 48, 48, 0x4c00ff, 0.3)
            .setStrokeStyle(2, 0x4c00ff)
            .setDepth(1)
            .setVisible(false);

        this.selectedTileController.onChange((x, y) => {
            this.onSetActiveTile(x, y);
        })
    }

    private onSetActiveTile(tileX: number, tileY: number) {
        const x = tileX * 48;
        const y = tileY * 48;

        this.highlightImage
            .setVisible(true)
            .setPosition(x, y);
    }
}