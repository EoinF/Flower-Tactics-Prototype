import { BaseUIObject } from "../generic/UIObject";

export class PlacedFlowerWidget extends BaseUIObject {
    private flowerOutline: Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene, x: number, y: number, playerColour: Phaser.Display.Color) {
        super(scene, x, y, 48, 48);
        this.flowerOutline = scene.add.image(0, 0, 'flower-outline')
            .setTint(playerColour.color);
        this.container.addChild(this.flowerOutline);
        this.container.addChild(scene.add.image(0, 0, 'flower-inner'));
    }
}