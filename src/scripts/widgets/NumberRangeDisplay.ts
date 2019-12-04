import { BaseUIObject } from "./BaseUIObject";
import { TextLabel } from "./TextLabel";
import { COLOURS } from "./constants";
import { UIContainer } from "./UIContainer";
import { FlexUIContainer } from "./FlexUIContainer";
import { RectangleSprite } from "./RectangleSprite";

interface Range {
    min: number;
    max: number;
}

export class NumberRangeDisplay implements BaseUIObject {
    private mainContainer: UIContainer;
    private backgroundImage: Phaser.GameObjects.Sprite;
    private rangeValuesImageFront: Phaser.GameObjects.Rectangle;
    private rangeValuesImageSides: Phaser.GameObjects.Rectangle;
    private range: Range;
    private startLabel: TextLabel;
    private endLabel: TextLabel;
    
    private minValue: number;
    private maxValue: number;

    x: number;
    y: number;
    width: number;
    height: number;
    originX: number;
    originY: number;
    alpha: number;

    constructor(
        scene: Phaser.Scene, x: number, y: number,
        width: number, height: number,
        colourStart: Phaser.Display.Color, colourEnd: Phaser.Display.Color,
        range: Range,
        labels: { startLabelText: string, endLabelText: string }
    ) {
        this.range = range;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.originX = this.originY = 0;
        this.minValue = 5;
        this.maxValue = 10;

        this.startLabel = new TextLabel(scene, 0, 0, labels.startLabelText, COLOURS.BLACK, true, 10);
        this.endLabel = new TextLabel(scene, 0, 0, labels.endLabelText, COLOURS.BLACK, true, 10);

        this.backgroundImage = new RectangleSprite(scene, 2 + this.startLabel.width, 0, 
            width - this.startLabel.width - this.endLabel.width - 4, height, 0.4)
            .setTint(
                colourStart.color, colourEnd.color,
                colourStart.color, colourEnd.color
            ).setOrigin(0, 0);

        this.rangeValuesImageSides = scene.add.rectangle(0, 1, this.backgroundImage.width, this.backgroundImage.height - 2)
            .setOrigin(0,0)
            .setFillStyle(colourStart.color, 1);
        this.rangeValuesImageFront = scene.add.rectangle(1, 1, this.backgroundImage.width, this.backgroundImage.height - 2, 1)
            .setOrigin(0,0)
            .setFillStyle(colourEnd.color, 1);

        this.mainContainer = new UIContainer(scene, x, y, width, height);
        this.mainContainer.addChild(this.startLabel, "Middle");
        this.mainContainer.addChild(this.rangeValuesImageSides, "Middle");
        this.mainContainer.addChild(this.rangeValuesImageFront, "Middle");
        this.mainContainer.addChild(this.backgroundImage, "Middle");
        this.mainContainer.addChild(this.endLabel, "Middle", "Right");
    }

    setAlpha (alpha: number) : BaseUIObject {
        this.alpha = alpha;
        this.mainContainer.setAlpha(alpha);
        return this;
    }
    setPosition(x: number, y: number): BaseUIObject {
        this.x = this.originX = x;
        this.y = this.originY = y;
        this.mainContainer.setPosition(x, y);
        return this;
    }
    setVisible (isVisible: boolean) : BaseUIObject {
        this.mainContainer.setVisible(isVisible);
        return this;
    }
    setDepth (depth: number) : BaseUIObject {
        this.mainContainer.setDepth(depth);
        return this;
    }
    destroy () {
        this.mainContainer.destroy();
    };
    getData (key: string): any {
        this.mainContainer.getData(key)
    }
    setData (key: string, value: any) : BaseUIObject {
        this.mainContainer.setData(key, value);
        return this;
    }

    removeInteractive () : BaseUIObject {
        this.mainContainer.setInteractive();
        return this;
    }

    setValues(values: {min: number, max: number}) {
        this.minValue = values.min;
        this.maxValue = values.max;
        
        const totalRangeAmount = this.range.max - this.range.min;
        const rangeScale = ((this.maxValue - this.minValue) / totalRangeAmount);
        const rangeX = this.width * (this.minValue / totalRangeAmount);
        this.rangeValuesImageFront.setPosition(this.backgroundImage.x + rangeX + 1, this.rangeValuesImageFront.y);
        this.rangeValuesImageFront.setScale(rangeScale - (2 / this.width), 1);
        this.rangeValuesImageSides.setPosition(this.backgroundImage.x + rangeX, this.rangeValuesImageFront.y);
        this.rangeValuesImageSides.setScale(rangeScale, 1);
    }
}