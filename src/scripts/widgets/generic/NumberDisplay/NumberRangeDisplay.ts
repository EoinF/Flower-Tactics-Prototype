import { NumberDisplayBase, NumberRange } from "./NumberDisplayBase";

export class NumberRangeDisplay extends NumberDisplayBase {
    private rangeValuesImageFront: Phaser.GameObjects.Rectangle;
    private rangeValuesImageSides: Phaser.GameObjects.Rectangle;

    private numberRange: NumberRange;
    private currentValues: NumberRange;

    constructor(
        scene: Phaser.Scene, x: number, y: number,
        width: number, height: number,
        colourStart: Phaser.Display.Color, colourEnd: Phaser.Display.Color,
        labels: { startLabelText: string, endLabelText: string },
        numberRange: NumberRange
    ) {
        super(scene, x, y, width, height, colourStart, colourEnd, labels);
        this.numberRange = numberRange;
        this.currentValues = { min: 500, max: 1000};

        this.rangeValuesImageSides = scene.add.rectangle(1, 1, this.backgroundImage.width, this.backgroundImage.height - 9)
            .setOrigin(0,0)
            .setFillStyle(colourStart.color, 1);
        this.rangeValuesImageFront = scene.add.rectangle(1, 1, this.backgroundImage.width, this.backgroundImage.height - 10)
            .setOrigin(0,0)
            .setFillStyle(colourEnd.color, 1);

        this.mainContainer.addChild(this.rangeValuesImageSides, "Middle");
        this.mainContainer.addChild(this.rangeValuesImageFront, "Middle");
    }

    setValues(values: NumberRange) {
        this.currentValues = { min: values.min, max: values.max};
        
        const totalRangeAmount = this.numberRange.max - this.numberRange.min;
        const rangeScale = ((this.currentValues.max - this.currentValues.min) / totalRangeAmount);
        const rangeX = this.width * (this.currentValues.min / totalRangeAmount);
        this.rangeValuesImageFront.setPosition(this.backgroundImage.x + rangeX + 1, this.rangeValuesImageFront.y);
        this.rangeValuesImageFront.setScale(rangeScale - (2 / this.width), 1);
        this.rangeValuesImageSides.setPosition(this.backgroundImage.x + rangeX, this.rangeValuesImageFront.y);
        this.rangeValuesImageSides.setScale(rangeScale, 1);
    }
}