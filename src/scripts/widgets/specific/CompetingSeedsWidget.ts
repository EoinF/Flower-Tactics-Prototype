import { TextLabel } from "../generic/TextLabel";
import { COLOURS } from "../../constants";
import { BaseUIObject } from "../generic/UIObject";

const playRate = 1;

export class CompetingSeedsWidget extends BaseUIObject {
    constructor(scene: Phaser.Scene,
        x: number, y: number,
        width: number, height: number,
        amount1: number,
        player1Colour: Phaser.Display.Color,
        amount2: number,
        player2Colour: Phaser.Display.Color
    ) {
        super(scene, x, y, width, height);
        const amount1Text = new TextLabel(scene, 8, 4, amount1.toString(), COLOURS.WHITE, { fontSize: 14, strokeThickness: 2 })
             .setOrigin(0, 0);

        const seed1Sprite = scene.add.image(0, 8, 'seed2')
            .setTint(player1Colour.color);
        
        const amount2Text = new TextLabel(scene, 8, 4, amount2.toString(), COLOURS.WHITE, { fontSize: 14, strokeThickness: 2 })
            .setOrigin(1, 0);

       const seed2Sprite = scene.add.image(0, 8, 'seed2')
           .setTint(player2Colour.color);
        
        this.container.addChild(seed1Sprite, "Top", "Left");
        this.container.addChild(amount1Text, "Bottom", "Left");
        
        this.container.addChild(seed2Sprite, "Top", "Right");
        this.container.addChild(amount2Text, "Bottom", "Right");

        this.createCompeteAnimation(scene, seed1Sprite, amount1Text.getTextObject(), amount1, amount2, false);
        this.createCompeteAnimation(scene, seed2Sprite, amount2Text.getTextObject(), amount2, amount1, true);
    }

    createCompeteAnimation(scene: Phaser.Scene, seedSprite: Phaser.GameObjects.Image, textLabel: Phaser.GameObjects.Text, 
        amount: number, otherAmount: number, isFlipped: boolean
    ) {
        let finalDeltaX = 18;
        if (amount < otherAmount) {
            finalDeltaX = 14
        } else if (amount > otherAmount) {
            finalDeltaX = 22;
        }
        scene.tweens.add({
            targets: [seedSprite],
            x: `${isFlipped ? '+': '-'}=8`,
            ease: 'Linear',
            duration: 100 * playRate
        }).on('complete', () => {
            scene.tweens.add({
                targets: [seedSprite],
                x: `${isFlipped ? '-': '+'}=${finalDeltaX}`,
                ease: 'Elastic',
                duration: 600 * playRate
            });
            if (amount <= otherAmount) {
                scene.tweens.add({
                    targets: [seedSprite, textLabel],
                    alpha: 0,
                    ease: 'Linear',
                    duration: 400 * playRate,
                    delay: 100
                });
            }
        });
    }
}