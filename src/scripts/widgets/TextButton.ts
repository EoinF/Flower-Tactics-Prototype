import { VerticalAlignment, HorizontalAlignment, COLOURS } from "./constants";
import { UIContainer } from "./UIContainer";
import { BaseButton } from "./BaseButton";

export class TextButton extends BaseButton {
    constructor(
        scene: Phaser.Scene, 
        x: number, y: number, 
        width: number, height: number,
        text: string,
        colourUp: Phaser.Display.Color = COLOURS.WHITE,
        colourDown: Phaser.Display.Color = COLOURS.LIGHT_GRAY,
        verticalAlignment: VerticalAlignment = "Top",
        horizontalAlignment: HorizontalAlignment = "Left") {

        super(scene, x, y, width, height, colourUp, colourDown, verticalAlignment, horizontalAlignment);
        
        const buttonText = scene.add.text(0, 0, text)
            .setTint(0x0);
        
        const differenceX = width - buttonText.width;
        const differenceY = height - buttonText.height;
        buttonText.setPadding(differenceX / 2, differenceY / 2, differenceX / 2, differenceY / 2);
        
        this.container.addChild(buttonText);
    }
}