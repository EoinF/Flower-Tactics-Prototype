import { BaseUIObject, UIObject } from "../generic/UIObject";
import { CloudLayout } from "../../controllers/HeldObjectController";
import { COLOURS } from "../../constants";

export class HeldCloudsWidget extends BaseUIObject {

    constructor(scene: Phaser.Scene, x: number, y: number,
        backgroundColour: Phaser.Display.Color = COLOURS.withAlpha(COLOURS.TURQUOISE, 0.2),
        borderColour: Phaser.Display.Color = COLOURS.withAlpha(COLOURS.BLACK, 0.2)
    ) {
        super(scene, x - 24, y - 24, 48 * 3, 48 * 3);
        
        this.container
            .setBorder(1, borderColour)
            .setBackground(backgroundColour);

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++)
            this.container.addChild(scene.add.image(i * 48, j * 48, 'cloud'));
        }
    }

    setCloudLayout(cloudLayout: CloudLayout) {
        this.setVisible(true);
        for (let i = 0; i < cloudLayout.length; i++) {
            this.container.children[i].setVisible(cloudLayout[i]);
        }
    }

    hideCloudLayout() {
        this.setVisible(false);
    }
    
    setPosition (x: number, y: number) {
        this.x = x - 24;
        this.y = y - 24;
        super.setPosition(this.x, this.y);
        return this;
    }
}