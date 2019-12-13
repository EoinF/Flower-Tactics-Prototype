import { BaseButton } from "./BaseButton";
import { TextLabel } from "./TextLabel";
import { COLOURS } from "../../constants";
import { HorizontalAlignment, VerticalAlignment } from "../../types";

export class TextButton extends BaseButton {
    constructor(
        scene: Phaser.Scene,
        x: number, y: number,
        width: number, height: number,
        text: string,
        textColour: Phaser.Display.Color = COLOURS.BLACK,
        colourUp: Phaser.Display.Color = COLOURS.WHITE,
        colourDown: Phaser.Display.Color = COLOURS.LIGHT_GRAY,
        verticalAlignment: VerticalAlignment = "Top",
        horizontalAlignment: HorizontalAlignment = "Left") {

        super(scene, x, y, width, height, colourUp, colourDown, verticalAlignment, horizontalAlignment);
        
        const buttonText = new TextLabel(scene, 0, 0, text, textColour, {isBold: true});
        this.container.addChild(buttonText, "Middle", "Middle");
    }
}