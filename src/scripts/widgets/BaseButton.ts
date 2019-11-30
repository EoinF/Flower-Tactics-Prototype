import { VerticalAlignment, HorizontalAlignment, COLOURS } from "./constants";
import { UIContainer } from "./UIContainer";
import { BaseUIObject } from "./BaseUIObject";

export class BaseButton implements BaseUIObject {
    x: number;
    y: number;
    width: number;
    height: number;

    originX: number;
    originY: number;

    alpha: number;
    borderThickness: number;
    borderColour: Phaser.Display.Color;
    
    colourUp: Phaser.Display.Color;
    colourDown: Phaser.Display.Color;
    protected container: UIContainer;

    constructor(
        scene: Phaser.Scene, 
        x: number, y: number,
        width: number, height: number,
        colourUp: Phaser.Display.Color,
        colourDown: Phaser.Display.Color,
        verticalAlignment: VerticalAlignment = "Top",
        horizontalAlignment: HorizontalAlignment = "Left"
    ) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.originX = 0;
        this.originY = 0;
        this.colourUp = colourUp;
        this.colourDown = colourDown;
        this.borderThickness = 0;
        this.borderColour = COLOURS.BLACK;

        this.container = new UIContainer(scene, x, y, width, height, verticalAlignment, horizontalAlignment);
        this.container.setInteractive()
            .setBackground(this.colourUp);

        scene.input.on('pointerup', () => {
            this.onPointerUp();
        });
        this.container.on('pointerdown', () => {
            this.onPointerDown();
        });
    }

    protected onPointerUp() {
        this.container.setBackground(this.colourUp);
    }
    protected onPointerDown() {
        this.container.setBackground(this.colourDown);
    }

    setPosition (x: number, y: number) {
        this.x = x;
        this.y = y;
        this.container.setPosition(x, y);
        return this;
    }

    setVisible (isVisible: boolean) {
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

    setBackground(colourUp: Phaser.Display.Color, colourDown: Phaser.Display.Color) {
        this.colourUp = colourUp;
        this.colourDown = colourDown;
        return this;
    }

    setBorder(thickness: number, strokeColour: Phaser.Display.Color) {
        this.borderColour = strokeColour;
        this.borderThickness = thickness;
        this.container.setBorder(thickness, strokeColour);
        return this;
    }

    onClick(callback: Function) {
        this.container.on('pointerup', callback);
        return this;
    };

    onHover(callback: Function) {
        this.container.on('pointermove', callback);
        return this;
    };

    setAlpha(alpha: number) {
        this.container.setAlpha(alpha);
        return this;
    }

    hits(x: number, y: number) {
        return this.container.hits(x, y);
    }
}