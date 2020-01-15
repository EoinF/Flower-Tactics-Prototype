import { BaseButton } from "./BaseButton";
import { VerticalAlignment, HorizontalAlignment } from "../../types";
import { UIObject } from "./UIObject";

export class ContainerButton extends BaseButton {
    constructor(scene: Phaser.Scene, 
        x: number, y: number,
        width: number, height: number,
        colourUp: Phaser.Display.Color,
        colourDown: Phaser.Display.Color,
        verticalAlignment: VerticalAlignment = "Top",
        horizontalAlignment: HorizontalAlignment = "Left"
    ) {
        super(scene, x, y, width, height, colourUp, colourDown, verticalAlignment, horizontalAlignment);
    }
    
    addChild(child: UIObject,
        verticalAlignment: VerticalAlignment = "Top",
        horizontalAlignment: HorizontalAlignment = "Left"
    ) {
        this.container.addChild(child, verticalAlignment, horizontalAlignment);
        return this;
    }
}