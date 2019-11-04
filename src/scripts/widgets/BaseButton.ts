import { VerticalAlignment, HorizontalAlignment } from "./constants";
import { UIContainer } from "./UIContainer";
import { BaseUIObject } from "./BaseUIObject";

export class BaseButton implements BaseUIObject {
    x: number;
    y: number;
    width: number;
    height: number;
    
    protected colourUp: Phaser.Display.Color;
    protected colourDown: Phaser.Display.Color;
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
        this.colourUp = colourUp;
        this.colourDown = colourDown;

        this.container = new UIContainer(scene, x, y, width, height, verticalAlignment, horizontalAlignment);
        this.container.setInteractive()
            .setBackground(this.colourUp, 1);

        scene.input.on('pointerup', () => {
            this.onPointerUp();
        });
        this.container.on('pointerdown', () => {
            this.onPointerDown();
        });
    }

    protected onPointerUp() {
        this.container.setBackground(this.colourUp, 1);
    }
    protected onPointerDown() {
        this.container.setBackground(this.colourDown, 1);
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

    setBackground(colourUp: Phaser.Display.Color, colourDown: Phaser.Display.Color) {
        this.colourUp = colourUp;
        this.colourDown = colourDown;
        return this;
    }

    setBorder(thickness: number, strokeColour: Phaser.Display.Color) {
        this.container.setBorder(thickness, strokeColour);
        return this;
    }

    onClick(callback: Function) {
        this.container.on('pointerup', callback);
        return this;
    };
}