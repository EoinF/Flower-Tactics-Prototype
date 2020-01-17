import { BaseUIObject } from "../generic/UIObject";
import { COLOURS } from "../../constants";

export class HeldCloudsWidget extends BaseUIObject {
    constructor(scene: Phaser.Scene, x: number, y: number,
        backgroundColour: Phaser.Display.Color = COLOURS.withAlpha(COLOURS.TURQUOISE, 0.4),
        borderColour: Phaser.Display.Color = COLOURS.withAlpha(COLOURS.BLACK, 0.3)
    ) {
        super(scene, x - 24, y - 24, 48, 48);
        
        this.container
            .setBorder(1, borderColour)
            .setBackground(backgroundColour);

        this.container.addChild(scene.add.image(0, 0, 'cloud'));
    }
    
    setPosition (x: number, y: number) {
        this.x = x - 24;
        this.y = y - 24;
        super.setPosition(this.x, this.y);
        return this;
    }
}