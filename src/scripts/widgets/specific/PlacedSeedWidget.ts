import { TextLabel } from "../generic/TextLabel";
import { COLOURS } from "../generic/constants";

export class PlacedSeedWidget {
    private amount: number;

    private seedSprite: Phaser.GameObjects.Image;
    private amountText: TextLabel;

    constructor(scene: Phaser.Scene,
        x: number, y: number,
        seedAmount: number
    ) {
        this.amount = seedAmount;
        this.seedSprite = scene.add.image(x, y, "seed2")
			.setInteractive()
			.setDepth(99);
        this.amountText = new TextLabel(scene, x + 20, y + 4, seedAmount.toString(), COLOURS.WHITE, false, 14, 2)
             .setOrigin(1, 0)

        if (this.amount < 2) { 
            this.amountText.setVisible(false);
        }
    }

    getAmount() {
        return this.amount;
    }

    setAmount(newAmount: number) {
        this.amount = newAmount;
        this.amountText.setText(this.amount.toString());
        if (this.amount > 1) {
            this.amountText.setVisible(true);
        }
    }

    onClick(callback: (pointer: Phaser.Input.Pointer) => void) {
        this.seedSprite.on('pointerdown', callback);
    }

    destroy() {
        this.seedSprite.destroy();
        this.amountText.destroy();
    }
}