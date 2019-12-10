import { BaseUIObject } from "./BaseUIObject";
import { COLOURS } from "./constants";
import { TextLabel } from "./TextLabel";
import { UIContainer } from "./UIContainer";
import { RectangleSprite } from "./RectangleSprite";

export class ProgressBar implements BaseUIObject {
    private value: number;
    private maxValue: number;

    x: number;
    y: number;
    width: number;
    height: number;

    originX: number;
    originY: number;

    alpha: number;
    borderThickness: number;
    borderColour: Phaser.Display.Color;
    visible: boolean;
    
    protected container: UIContainer;
    protected progressLabel: TextLabel;
    protected progressRectangle: RectangleSprite;

    constructor(scene: Phaser.Scene, x: number, y: number, value: number, maxValue: number) {
        this.maxValue = maxValue;
        this.progressLabel = new TextLabel(scene, 4, 0, `${maxValue}/${maxValue}`, COLOURS.BLACK, true, 8)
            .setDepthOffset(1);
        this.container = new UIContainer(scene, x, y, this.progressLabel.width, this.progressLabel.height)
            .setBackground(COLOURS.LIGHT_GRAY)
            .setBorder(1, COLOURS.BLACK);

        this.progressRectangle = new RectangleSprite(scene, 0, 0, this.container.width, this.container.height, 1, undefined, {
            color: COLOURS.WHITE.color,
            alpha: 1
        }).setOrigin(0, 0.5);
        
        this.container.addChild(this.progressLabel);
        this.container.addChild(this.progressRectangle);
        this.setValue(value);
        this.setProgressColour(COLOURS.YELLOW, COLOURS.LIGHT_YELLOW);

        this.x = x;
        this.y = y;
        this.width = this.container.width;
        this.height = this.container.height;
        this.originX = 0;
        this.originY = 0;
        this.alpha = 1;
        this.visible = true;
        this.borderThickness = 0;
        this.borderColour = COLOURS.BLACK;
    }
    
    setPosition (x: number, y: number) {
        this.x = x;
        this.y = y;
        this.container.setPosition(x, y);
        return this;
    }

    setVisible (isVisible: boolean) {
        this.visible = isVisible;
        this.container.setVisible(isVisible);
        return this;
    }
    setDepth (depth: number) {
        this.container.setDepth(depth);
        return this;
    }

    getData(key: string) {
        return this.container.getData(key);
    }

    setData(key: string, value: any) {
        this.container.setData(key, value);
        return this;
    }

    removeInteractive() {
        this.container.removeInteractive();
        return this;
    }

    destroy() {
        this.container.destroy();
    }

    setProgressColour(colourLeft: Phaser.Display.Color, colourRight: Phaser.Display.Color) {
        this.progressRectangle.setTint(colourLeft.color, colourRight.color, colourLeft.color, colourRight.color);
        return this;
    }

    setBackground(colour: Phaser.Display.Color) {
        this.container.setBackground(colour);
        return this;
    }

    setBorder(thickness: number, strokeColour: Phaser.Display.Color) {
        this.borderColour = strokeColour;
        this.borderThickness = thickness;
        this.container.setBorder(thickness, strokeColour);
        return this;
    }

    setAlpha(alpha: number) {
        this.container.setAlpha(alpha);
        return this;
    }

    setValue(value: number) {
        this.value = value;
        this.progressLabel.setText(`${this.value}/${this.maxValue}`);
        this.progressRectangle.setScale(this.value / this.maxValue, 1);
    }
}