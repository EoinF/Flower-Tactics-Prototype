import { BaseUIObject } from "../../widgets/generic/UIObject";
import { COLOURS } from "../../constants";
import { TextLabel } from "../../widgets/generic/TextLabel";
import { TextButton } from "../../widgets/generic/TextButton";

export class SeedInventoryTile extends BaseUIObject {
    private seedAmountLabel: TextLabel;
    private addSeedButton: TextButton;
    private addSeedCallbacks: (() => void)[];

    constructor(scene: Phaser.Scene, x: number, y: number, 
        width: number, height: number, 
        name: string, amount: number
    ) {
        super(scene, x, y, width, height);
        this.container.setBorder(1, COLOURS.GRAY);
        const seedName = new TextLabel(scene, 4, 4, name);
        const seedImage = scene.add.image(4, 4, 'seed2');
        this.seedAmountLabel = new TextLabel(scene, seedImage.width + 4, 4, ` x ${amount}`)
        
        this.addSeedButton = new TextButton(scene, 4, 4, 24, 24, ">")
            .setBorder(1, COLOURS.GRAY)
            .onClick(() => this.addSeedCallbacks.forEach(callback => callback()))
            .setVisible(amount > 0)
        this.container.addChild(this.addSeedButton, "Bottom", "Right");
        
        this.container.addChild(seedName);
        this.container.addChild(seedImage, "Bottom");
        this.container.addChild(this.seedAmountLabel, "Bottom");

        this.addSeedCallbacks = [];
    }

    setBackground(colour: Phaser.Display.Color) {
        this.container.setBackground(colour);
        return this;
    }

    setAmount(amount: number) {
        this.seedAmountLabel.setText(" x " + amount.toString());
        this.addSeedButton.setVisible(amount > 0);
        return this;
    }

    onAddSeed(callback: () => void) {
        this.addSeedCallbacks.push(callback);
        return this;
    }
}