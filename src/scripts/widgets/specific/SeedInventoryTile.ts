import { BaseUIObject } from "../generic/UIObject";
import { COLOURS, SEED_INTERVALS } from "../../constants";
import { TextLabel } from "../generic/TextLabel";
import { TextButton } from "../generic/TextButton";
import { BaseButton } from "../generic/BaseButton";

export class SeedInventoryTile extends BaseButton {
    private seedAmountLabel: TextLabel;
    private addSeedButton: TextButton;
    private addSeedCallbacks: (() => void)[];
     removeSeedButton: TextButton;
    private removeSeedCallbacks: (() => void)[];

    constructor(scene: Phaser.Scene, x: number, y: number, 
        width: number, height: number, 
        name: string, amount: number
    ) {
        super(scene, x, y, width, height, COLOURS.PURPLE_300, COLOURS.PURPLE_400);
        this.setBorder(1, COLOURS.GRAY);
        const seedName = new TextLabel(scene, 4, 4, name);
        const seedImage = scene.add.image(4, 4, 'seed2');
        this.seedAmountLabel = new TextLabel(scene, seedImage.width + 4, 4, ` x ${amount}`)
        
        this.addSeedButton = new TextButton(scene, 4, 4, 24, 24, ">")
            .setBorder(1, COLOURS.GRAY)
            .onClick(() => this.addSeedCallbacks.forEach(callback => callback()))
            .setVisible(amount >= SEED_INTERVALS[1]);
            
        this.removeSeedButton = new TextButton(scene, 8 + this.addSeedButton.width, 4, 24, 24, "<")
            .setBorder(1, COLOURS.GRAY)
            .onClick(() => this.removeSeedCallbacks.forEach(callback => callback()))
            .setVisible(false);

        this.container.addChild(this.addSeedButton, "Bottom", "Right");
        this.container.addChild(this.removeSeedButton, "Bottom", "Right");
        
        this.container.addChild(seedName);
        this.container.addChild(seedImage, "Bottom");
        this.container.addChild(this.seedAmountLabel, "Bottom");

        this.addSeedCallbacks = [];
        this.removeSeedCallbacks = [];
    }

    setAmount(amount: number, amountStagedIndex: number, isAnyStaged: boolean) {
        const amountStaged = SEED_INTERVALS[amountStagedIndex];
        const requiredAmountForNext = SEED_INTERVALS[amountStagedIndex + 1] - amountStaged;
        const amountStagedText = (amountStaged > 0) ? `(${amountStaged})` : '';
        const text = ` x ${amount}${amountStagedText}`;
        this.seedAmountLabel.setText(text);

        const isStaged = amountStaged > 0;
        this.removeSeedButton.setVisible(isStaged);
        this.addSeedButton.setVisible(amount >= requiredAmountForNext && (isStaged || !isAnyStaged));
        return this;
    }

    onAddSeed(callback: () => void) {
        this.addSeedCallbacks.push(callback);
        return this;
    }

    onRemoveSeed(callback: () => void) {
        this.removeSeedCallbacks.push(callback);
        return this;
    }
}