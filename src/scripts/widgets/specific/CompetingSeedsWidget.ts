import { TextLabel } from "../generic/TextLabel";
import { COLOURS, END_OF_TURN_DURATION } from "../../constants";
import { BaseUIObject } from "../generic/UIObject";

interface CompetingAnimations {
    moveOut: Phaser.Tweens.Tween;
    moveIn: Phaser.Tweens.Tween;
    moveOutLosing: Phaser.Tweens.Tween;
    moveInLosing: Phaser.Tweens.Tween;
    moveOutWinning: Phaser.Tweens.Tween;
    moveInWinning: Phaser.Tweens.Tween;
    fadeOut: Phaser.Tweens.Tween;
}

export class CompetingSeedsWidget extends BaseUIObject {
    private seed1Sprite: Phaser.GameObjects.Image;
    private seed2Sprite: Phaser.GameObjects.Image;
    
    private seed1Label: TextLabel;
    private seed2Label: TextLabel;

    private seed1Animation: CompetingAnimations;
    private seed2Animation: CompetingAnimations;


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

        this.seed1Animation = this.createCompeteAnimation(scene, this.seed1Sprite, this.seed1Label.getTextObject(), false);
        this.seed2Animation = this.createCompeteAnimation(scene, this.seed2Sprite, this.seed2Label.getTextObject(), true);
    }

    applyEndOfTurnAnimation(amount1: number, colour1: Phaser.Display.Color, amount2: number, colour2: Phaser.Display.Color) {
        this.setVisible(true);
        this.seed1Label.setText(amount1.toString());
        this.seed1Sprite.setTint(colour1.color);
        this.seed2Label.setText(amount2.toString());
        this.seed2Sprite.setTint(colour2.color);
        this.playCompeteAnimation(this.seed1Animation, amount1, amount2);
        this.playCompeteAnimation(this.seed2Animation, amount2, amount1);
    }

    createCompeteAnimation(scene: Phaser.Scene, seedSprite: Phaser.GameObjects.Image, textLabel: Phaser.GameObjects.Text, isFlipped: boolean): CompetingAnimations {
        const [moveOut, moveOutWinning, moveOutLosing] =  [8, 8, 8].map(deltaX => 
            scene.tweens.add({
                targets: [seedSprite],
                x: `${isFlipped ? '+': '-'}=${deltaX}`,
                ease: 'Linear',
                duration: END_OF_TURN_DURATION * 0.2
            })
        );

        const [moveIn, moveInWinning, moveInLosing] = [18, 22, 14].map(deltaX => 
            scene.tweens.add({
                targets: [seedSprite],
                x: `${isFlipped ? '-': '+'}=${deltaX}`,
                ease: 'Elastic',
                duration: END_OF_TURN_DURATION * 0.8,
                onComplete: () => {
                    this.setVisible(false);
                }
            })
        );

        moveOut.on('complete', () => moveIn.restart());
        moveOutWinning.on('complete', () => moveInWinning.restart());
        moveOutLosing.on('complete', () => moveInLosing.restart());

        const fadeOut = scene.tweens.add({
            targets: [seedSprite, textLabel],
            alpha: {from: 1, to: 0},
            ease: 'Linear',
            duration: END_OF_TURN_DURATION * 0.5,
            delay: END_OF_TURN_DURATION * 0.5
        });

        return {
            moveIn,
            moveInLosing,
            moveInWinning,
            moveOut,
            moveOutLosing,
            moveOutWinning,
            fadeOut
        }
    }

    playCompeteAnimation(animation: CompetingAnimations, amount: number, otherAmount: number) {
        Object.keys(animation).forEach(key => {
            const tween: Phaser.Tweens.Tween = animation[key];
            tween.pause();
            tween.seek(0);
        })
        if (amount < otherAmount) {
            animation.moveOutLosing.play();
            animation.fadeOut.play();
            animation.moveOutLosing.restart();
            animation.fadeOut.restart();
        } else if (amount > otherAmount) {
            animation.moveOutWinning.play();
            animation.moveOutWinning.restart();
        } else {
            animation.moveOut.play();
            animation.fadeOut.play();
            animation.moveOut.restart();
            animation.fadeOut.restart();
        }
    }
}