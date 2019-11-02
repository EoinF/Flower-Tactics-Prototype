import { VerticalAlignment, HorizontalAlignment } from "./constants";
import { getAlignedCoordinates } from "./utils";

export class UIContainer{
    container: Phaser.GameObjects.Container;
    backgroundImage: Phaser.GameObjects.Rectangle;

    constructor(scene: Phaser.Scene, 
        x: number, y: number, 
        width: number, height: number, 
        verticalAlignment: VerticalAlignment = "Top", 
        horizontalAlignment: HorizontalAlignment = "Left"
    ) {
        this.backgroundImage = new Phaser.GameObjects.Rectangle(scene, 0, 0, width, height, 0xccaaff, 1)
            .setStrokeStyle(1, 0x1a0033)
            .setOrigin(0, 0)
            .setDepth(2)
        
        const {x: ax, y: ay} = getAlignedCoordinates(scene, x, y, width, height, verticalAlignment, horizontalAlignment);

        this.container = scene.add.container(ax, ay, this.backgroundImage);
        this.container.setSize(width, height);
        this.container.setPosition(this.container.x, this.container.y);
        
    }

    addChild(child: Phaser.GameObjects.GameObject) {
        this.container.add(child);
        return this;
    }

    setVisible(isVisible: boolean) {
        this.backgroundImage.setVisible(isVisible);
        return this;
    }

    setBackgroundColour(color: Phaser.Display.Color | number) {
        if (typeof(color) === "number") {
            this.backgroundImage.setFillStyle(color);
        } else {
            this.backgroundImage.setFillStyle(color.color);
        }
        return this;
    }
}