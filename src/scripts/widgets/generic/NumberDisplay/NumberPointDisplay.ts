import { NumberDisplayBase, NumberRange } from "./NumberDisplayBase";

export class NumberPointDisplay extends NumberDisplayBase {
    private rangeValueImage: Phaser.GameObjects.Rectangle;

    private numberRange: NumberRange;
    private currentValue: number;

    constructor(
        scene: Phaser.Scene, x: number, y: number,
        width: number, height: number,
        colourStart: Phaser.Display.Color, colourEnd: Phaser.Display.Color,
        labels: { startLabelText: string, endLabelText: string },
        numberRange: NumberRange
    ) {
        super(scene, x, y, width, height, colourStart, colourEnd, labels);
        this.numberRange = numberRange;
        this.currentValue = 0;

        this.rangeValueImage = scene.add.circle(1, 1, 4)
            .setOrigin(0,0)
            .setFillStyle(colourEnd.color, 1)
            .setStrokeStyle(1, colourStart.color);

        this.mainContainer.addChild(this.rangeValueImage, "Middle");
    }

    setValue(value: number) {
        this.currentValue = value;
        
        const totalRangeAmount = this.numberRange.max - this.numberRange.min;
        const rangeX = this.width * (this.currentValue / totalRangeAmount);
        this.rangeValueImage.setPosition(this.backgroundImage.x + rangeX + 1, this.rangeValueImage.y);
    }
}