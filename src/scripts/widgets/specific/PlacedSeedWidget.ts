import { TextLabel } from "../generic/TextLabel";
import { COLOURS, END_OF_TURN_DURATION } from "../../constants";
import { BaseUIObject } from "../generic/UIObject";

export class PlacedSeedWidget extends BaseUIObject {
    private amount: number;
    private amountText: TextLabel;
    private seedSprite: Phaser.GameObjects.Image;

    constructor(scene: Phaser.Scene,
        x: number, y: number,
        width: number, height: number,
        seedAmount: number,
        playerColour: Phaser.Display.Color
    ) {
        super(scene, x, y, width, height);
        this.amount = seedAmount;
        this.amountText = new TextLabel(scene, 4, 4, seedAmount.toString(), COLOURS.WHITE, { fontSize: 14, strokeThickness: 2 })
             .setOrigin(1, 0);

        this.seedSprite = scene.add.image(0, 0, 'seed2')
            .setTint(playerColour.color);
        
        this.container.addChild(this.seedSprite, "Middle", "Middle");
        this.container.addChild(this.amountText, "Bottom", "Right");
    }

    getAmount() {
        return this.amount;
    }

    setAmount(newAmount: number) {
        this.amount = newAmount;
        this.amountText.setText(this.amount.toString());
        this.amountText.setVisible(this.amount > 1);
    }

    setColour(colour: Phaser.Display.Color) {
        this.seedSprite.setTint(colour.color);
    }
    
    applyEndOfTurnAnimation(scene: Phaser.Scene, amount: number, colour: Phaser.Display.Color) {
        this.setVisible(true);
        this.setAmount(amount);
        this.setColour(colour);

        const targets: any = [this.seedSprite];
        if (amount > 1) {
            targets.push(this.amountText);
        }
        scene.tweens.add({
            targets: targets,
            alpha: {from: 1, to: 0},
            ease: 'Linear',
            duration: END_OF_TURN_DURATION,
            onComplete: () => {
                this.setVisible(false);
            }
        });
    }
}