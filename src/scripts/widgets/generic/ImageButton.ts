import { BaseButton } from "./BaseButton";
import { COLOURS } from "../../constants";
import { VerticalAlignment, HorizontalAlignment } from "../../types";

export class ImageButton extends BaseButton {
    image: Phaser.GameObjects.Image;
    colourImageUp: Phaser.Display.Color;
    colourImageDown: Phaser.Display.Color;
    constructor(
        scene: Phaser.Scene, 
        x: number, y: number,
        imageTexture: string,
        width: number | "auto" = "auto", height: number | "auto" = "auto",
        colourUp: Phaser.Display.Color = COLOURS.WHITE,
        colourDown: Phaser.Display.Color = COLOURS.LIGHT_GRAY,
        colourImageUp: Phaser.Display.Color = COLOURS.WHITE,
        colourImageDown: Phaser.Display.Color = COLOURS.WHITE,
        verticalAlignment: VerticalAlignment = "Top",
        horizontalAlignment: HorizontalAlignment = "Left"
    ) {
        const image = scene.add.image(0, 0, imageTexture).setOrigin(0,0);
        
        super(scene, x, y, 
            width === "auto" ? image.width : width, 
            height === "auto" ? image.height : height, 
            colourUp, colourDown,
            verticalAlignment, horizontalAlignment
        );
        this.image = image;
        this.colourImageUp = colourImageUp;
        this.colourImageDown = colourImageDown;
        this.container.addChild(image, "Middle", "Middle");
        this.image.setTint(this.colourImageUp.color);
    }

    setBackground(
        colourUp: Phaser.Display.Color,
        colourDown: Phaser.Display.Color,
        colourImageUp: Phaser.Display.Color = this.colourImageUp,
        colourImageDown: Phaser.Display.Color = this.colourImageDown
    ) {
        this.colourImageUp = colourImageUp;
        this.colourImageDown = colourImageDown;
        return super.setBackground(colourUp, colourDown);
    }
    
    protected onPointerUp() {
        super.onPointerUp();
        this.image.setTint(this.colourImageUp.color);
    }
    protected onPointerDown() {
        super.onPointerDown();
        this.image.setTint(this.colourImageDown.color);
    }
}