import { SelectedObjectController } from "../controllers/SelectedObjectController";

const POPUP_OFFSET = {
    x: 32,
    y: -32
}

export class TileStatsView {
    private highlightImage: Phaser.GameObjects.Rectangle;
    private selectedObjectController: SelectedObjectController;

    constructor(scene: Phaser.Scene, SelectedObjectController: SelectedObjectController) {
        this.selectedObjectController = SelectedObjectController;

        this.highlightImage = scene.add.rectangle(0, 0, 48, 48, 0x4c00ff, 0.3)
            .setStrokeStyle(2, 0x4c00ff)
            .setDepth(1)
            .setVisible(false);

        this.selectedObjectController.selectedTileObservable().subscribe((activeObject) => {
            if (activeObject != null) {
                this.onSetActiveTile(activeObject.x, activeObject.y);
            } else {
                this.highlightImage.setVisible(false);
            }
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