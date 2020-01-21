import { TextLabel } from "../generic/TextLabel";
import { COLOURS } from "../../constants";
import { BaseUIObject } from "../generic/UIObject";

export class PlacedSeedWidget extends BaseUIObject {
    private amount: number;
    private amountText: TextLabel;

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

        const seedSprite = scene.add.image(0, 0, 'seed2')
            .setTint(playerColour.color);
        
        this.container.addChild(seedSprite, "Middle", "Middle");
        this.container.addChild(this.amountText, "Bottom", "Right");

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
}