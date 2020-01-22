import { BaseUIObject } from "../generic/UIObject";
import { COLOURS } from "../../constants";

export class PlacedFlowerWidget extends BaseUIObject {
    private flowerOutline: Phaser.GameObjects.Image;
    private flowerInner: Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene, x: number, y: number, playerColour: Phaser.Display.Color) {
        super(scene, x, y, 48, 48);
        this.flowerOutline = scene.add.image(0, 0, 'flower-outline')
            .setTint(playerColour.color);
        this.flowerInner = scene.add.image(0, 0, 'flower-inner');
        this.container.addChild(this.flowerOutline);
        this.container.addChild(this.flowerInner);
    }

    startDyingAnimation(scene: Phaser.Scene) {
        this.container.setBackground(COLOURS.PURPLE_700);
        scene.tweens.add({
            targets: [this.container.backgroundImage],
            alpha: 0,
            ease: 'Linear',
            duration: 500,
            yoyo: true,
            repeat: -1
        })
        scene.tweens.add({
            targets: [this.flowerOutline, this.flowerInner],
            alpha: 0.1,
            ease: 'Linear',
            duration: 500,
            yoyo: true,
            repeat: -1
        });
    }
}