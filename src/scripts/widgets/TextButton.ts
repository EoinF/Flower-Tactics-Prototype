import { VerticalAlignment, HorizontalAlignment } from "./constants";
import { getAlignedCoordinates } from "./utils";

export class TextButton {
    
    rectangle: Phaser.GameObjects.Rectangle;
    constructor(
        scene: Phaser.Scene, 
        x: number, y: number, 
        width: number, height: number,
        text: string,
        verticalAlignment: VerticalAlignment = "Top",
        horizontalAlignment: HorizontalAlignment = "Left") {

        const {x: ax, y: ay} = getAlignedCoordinates(scene, x, y, width, height, verticalAlignment, horizontalAlignment);

        this.rectangle = scene.add.rectangle(ax, ay, width, height, 0xeeddff)
            .setInteractive()
            .setStrokeStyle(1, 0x4c00ff, 0.5)
            .setOrigin(0, 0);

        const buttonText = scene.add.text(ax, ay, text)
            .setTint(0x0);
        
        const differenceX = width - buttonText.width;
        const differenceY = height - buttonText.height;
        buttonText.setPadding(differenceX / 2, differenceY / 2, differenceX / 2, differenceY / 2);
    }

    onClick(callback) {
        this.rectangle.on('pointerup', callback);
    };
}