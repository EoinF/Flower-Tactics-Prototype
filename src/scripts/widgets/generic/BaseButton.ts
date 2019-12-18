import { ClickableWidget } from "./ClickableWidget";
import { VerticalAlignment, HorizontalAlignment } from "../../types";
import { COLOURS } from "../../constants";


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
        this.container.setBackground(this.colourUp);
        return this;
    }

    onHover(callback: (pointer: Phaser.Input.Pointer) => void) {
        this.container.on('pointermove', callback);
        return this;
    };
}