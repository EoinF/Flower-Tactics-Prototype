import { VerticalAlignment, HorizontalAlignment, COLOURS } from "./constants";
import { BaseUIObject } from "./BaseUIObject";
import { Subject } from "rxjs";
import { ClickableWidget } from "./ClickableWidget";


export class BaseButton extends ClickableWidget {
    colourUp: Phaser.Display.Color;
    colourDown: Phaser.Display.Color;

    constructor(
        scene: Phaser.Scene, 
        x: number, y: number,
        width: number, height: number,
        colourUp: Phaser.Display.Color,
        colourDown: Phaser.Display.Color,
        verticalAlignment: VerticalAlignment = "Top",
        horizontalAlignment: HorizontalAlignment = "Left"
    ) {
        super(scene, x, y, width, height, verticalAlignment, horizontalAlignment);

        this.container.setBackground(colourUp);
        
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
    }

    protected onPointerUp() {
        this.container.setBackground(this.colourUp);
    }
    protected onPointerDown() {
        this.container.setBackground(this.colourDown);
    }

    setBackground(colourUp: Phaser.Display.Color, colourDown: Phaser.Display.Color) {
        this.colourUp = colourUp;
        this.colourDown = colourDown;
        return this;
    }

    onHover(callback: (pointer: Phaser.Input.Pointer) => void) {
        this.container.on('pointermove', callback);
        return this;
    };
}