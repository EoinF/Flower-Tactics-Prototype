import { TextLabel } from "../generic/TextLabel";
import { COLOURS } from "../../constants";
import { BaseUIObject } from "../generic/UIObject";

const playRate = 1;

export class CompetingSeedsWidget extends BaseUIObject {
    
    private seed1Sprite: Phaser.GameObjects.Image;
    private seed2Sprite: Phaser.GameObjects.Image;
    
    private seed1Label: TextLabel;
    private seed2Label: TextLabel;

    private originalX1: number;
    private originalY1: number;
    private originalX2: number;
    private originalY2: number;

    constructor(scene: Phaser.Scene,
        x: number, y: number,
        width: number, height: number,
        amount1: number,
        player1Colour: Phaser.Display.Color,
        amount2: number,
        player2Colour: Phaser.Display.Color
    ) {
        super(scene, x, y, width, height);
        this.seed1Label = new TextLabel(scene, 8, 4, amount1.toString(), COLOURS.WHITE, { fontSize: 14, strokeThickness: 2 })
             .setOrigin(0, 0);

        this.seed1Sprite = scene.add.image(0, 8, 'seed2')
            .setTint(player1Colour.color);
        
        this.seed2Label = new TextLabel(scene, 8, 4, amount2.toString(), COLOURS.WHITE, { fontSize: 14, strokeThickness: 2 })
            .setOrigin(1, 0);

        this.seed2Sprite = scene.add.image(0, 8, 'seed2')
           .setTint(player2Colour.color);
        
        this.container.addChild(this.seed1Sprite, "Top", "Left");
        this.container.addChild(this.seed1Label, "Bottom", "Left");
        
        this.container.addChild(this.seed2Sprite, "Top", "Right");
        this.container.addChild(this.seed2Label, "Bottom", "Right");
    }

    applyEndOfTurnAnimation(scene: Phaser.Scene, amount1: number, colour1: Phaser.Display.Color, amount2: number, colour2: Phaser.Display.Color) {
        this.setVisible(true);
        this.seed1Label.setText(amount1.toString());
        this.seed1Sprite.setTint(colour1.color);
        this.seed2Label.setText(amount2.toString());
        this.seed2Sprite.setTint(colour2.color);
        this.createCompeteAnimation(scene, this.seed1Sprite, this.seed1Label.getTextObject(), amount1, amount2, false);
        this.createCompeteAnimation(scene, this.seed2Sprite, this.seed2Label.getTextObject(), amount2, amount1, true);
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
            }).on('complete', () => {
                if (isFlipped) {
                    seedSprite.x += finalDeltaX - 8;
                } else {
                    seedSprite.x -= finalDeltaX - 8;
                }
                this.setVisible(false);
            });
            if (amount <= otherAmount) {
                scene.tweens.add({
                    targets: [seedSprite, textLabel],
                    alpha: {from: 1, to: 0},
                    ease: 'Linear',
                    duration: 400 * playRate,
                    delay: 100
                });
            }
        });
    }
}