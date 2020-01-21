import { BaseUIObject } from "../generic/UIObject";

export class PlacedCloudWidget extends BaseUIObject {
    private outlineSprite: Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene, x: number, y: number, playerColour: Phaser.Display.Color) {
        super(scene, x, y, 48, 48);
        this.container.addChild(scene.add.image(0, 0, 'cloud-inner'));
        this.outlineSprite = scene.add.image(0, 0, 'cloud-outline');
        this.container.addChild(this.outlineSprite.setTint(playerColour.color));
    }

    setPlayerColour(colour: Phaser.Display.Color) {
        this.outlineSprite.setTint(colour.color)
    }
}