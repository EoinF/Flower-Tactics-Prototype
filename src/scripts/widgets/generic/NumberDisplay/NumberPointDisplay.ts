import { NumberDisplayBase } from "./NumberDisplayBase";
import { NumberRange } from "../../../types";

export class NumberPointDisplay extends NumberDisplayBase {
    private rangeValueImage: Phaser.GameObjects.Rectangle;

    private rangeBounds: NumberRange;
    private currentValue: number;

    constructor(
        scene: Phaser.Scene, x: number, y: number,
        width: number, height: number,
        colourStart: Phaser.Display.Color, colourEnd: Phaser.Display.Color,
        labels: { startLabelText: string, endLabelText: string },
        rangeBounds: NumberRange
    ) {
        super(scene, x, y, width, height, colourStart, colourEnd, labels);
        this.rangeBounds = rangeBounds;
        this.currentValue = 0;

        this.rangeValueImage = scene.add.circle(0, 1, 4)
            .setOrigin(0,0)
            .setFillStyle(colourEnd.color, 1)
            .setStrokeStyle(1, colourStart.color);

        this.container.addChild(this.rangeValueImage, "Middle");
    }

    setValue(value: number) {
        this.currentValue = value;
        
        const totalRangeAmount = this.rangeBounds.max - this.rangeBounds.min;
        const rangeX = (this.backgroundImage.width - 2 - this.rangeValueImage.width) * (this.currentValue / totalRangeAmount);
        
        this.rangeValueImage.setPosition(this.backgroundImage.x + rangeX + 1, this.rangeValueImage.y);
    }
}