import { VerticalAlignment, HorizontalAlignment, COLOURS } from "./constants";
import { BaseButton } from "./BaseButton";

export class ImageButton extends BaseButton {
    image: Phaser.GameObjects.Image;
    colourImageUp: Phaser.Display.Color;
    colourImageDown: Phaser.Display.Color;
    constructor(
        scene: Phaser.Scene, 
        x: number, y: number,
        imageTexture: string,
        colourUp: Phaser.Display.Color = COLOURS.WHITE,
        colourDown: Phaser.Display.Color = COLOURS.LIGHT_GRAY,
        colourImageUp: Phaser.Display.Color = COLOURS.WHITE,
        colourImageDown: Phaser.Display.Color = COLOURS.WHITE,
        verticalAlignment: VerticalAlignment = "Top",
        horizontalAlignment: HorizontalAlignment = "Left"
    ) {
        const image = scene.add.image(0, 0, imageTexture)
            .setOrigin(0, 0);
        super(scene, x, y, image.width, image.height, colourUp, colourDown, verticalAlignment, horizontalAlignment);
        this.image = image;
        this.colourImageUp = colourImageUp;
        this.colourImageDown = colourImageDown;
        this.container.addChild(image);
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