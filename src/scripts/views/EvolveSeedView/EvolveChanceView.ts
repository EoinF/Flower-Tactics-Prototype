import { BaseUIObject, UIObject } from "../../widgets/generic/UIObject"
import { TextLabel } from "../../widgets/generic/TextLabel";
import { FlexUIContainer } from "../../widgets/generic/FlexUIContainer";
import { COLOURS, SUCCESS_INTERVALS, SUCCESS_PLUS_INTERVALS, SUCCESS_PLUS_2_INTERVALS, SUCCESS_PLUS_3_INTERVALS } from "../../constants";
import { EvolveSeedController } from "../../controllers/EvolveSeedController";

export class EvolveChanceView implements UIObject {
    x: number;
    y: number;
    width: number;
    height: number;

    originX: number;
    originY: number;

    alpha: number;
    borderThickness: number;
    borderColour: Phaser.Display.Color;
    visible: boolean;

    protected container: FlexUIContainer;

    constructor(scene: Phaser.Scene,
        x: number, y: number,
        width: number, evolveSeedController: EvolveSeedController) {
        
        this.container = new FlexUIContainer(scene, x, y, width, "grow")
            .setBackground(COLOURS.PURPLE_600)
            .setBorder(2, COLOURS.PURPLE_800);

        const labels: TextLabel[] = [];

        for (let i = 0; i < 4; i++) {
            const label = new TextLabel(scene, 16, 8, "Success+ chance = ", COLOURS.WHITE, { isBold: false, fontSize: 20 })
                .setVisible(false);
            labels.push(label);
            this.container.addChild(label);
        }

        evolveSeedController.stagedSeedsObservable().subscribe(stagedSeeds => {
            labels.forEach(label => label.setVisible(false));
            if (stagedSeeds === null) {
                labels[0].setVisible(true);
                labels[0].setText("Add a seed to see the odds of success...");
            } else {
                let index = 0;
                const stagedAmount = stagedSeeds.stagedAmount;
                if (SUCCESS_INTERVALS[stagedAmount] > 0) {
                    labels[index].setText(`Success chance = ${SUCCESS_INTERVALS[stagedAmount]}%`)
                        .setVisible(true)
                        .setColor(COLOURS.WHITE);
                    index++;
                } 
                if (SUCCESS_PLUS_INTERVALS[stagedAmount] > 0) {
                    labels[index].setText(`Success+ chance = ${SUCCESS_PLUS_INTERVALS[stagedAmount]}%`)
                        .setVisible(true)
                        .setColor(COLOURS.LIGHT_GREEN);
                    index++;
                }
                if (SUCCESS_PLUS_2_INTERVALS[stagedAmount] > 0) {
                    labels[index].setText(`Success++ chance = ${SUCCESS_PLUS_2_INTERVALS[stagedAmount]}%`)
                        .setVisible(true)
                        .setColor(COLOURS.YELLOW);
                    index++;
                }
                if (SUCCESS_PLUS_3_INTERVALS[stagedAmount] > 0) {
                    labels[index].setText(`Success+++ chance = ${SUCCESS_PLUS_3_INTERVALS[stagedAmount]}%`)
                        .setVisible(true)
                        .setColor(COLOURS.TURQUOISE);
                    index++;
                }
            }
        });

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = this.container.height;
        this.originX = 0;
        this.originY = 0;
        this.alpha = 1;
        this.borderThickness = 0;
        this.visible = true;
    }
    
    setPosition (x: number, y: number) {
        this.x = x;
        this.y = y;
        this.container.setPosition(x, y);
        return this;
    }

    setVisible (isVisible: boolean) {
        this.visible = isVisible;
        this.container.setVisible(isVisible);
        return this;
    }
    setDepth (depth: number) {
        this.container.setDepth(depth);
        return this;
    }

    getData(key: string) {
        return this.container.getData(key);
    }

    setData(key: string, value: any) {
        this.container.setData(key, value);
        return this;
    }

    removeInteractive() {
        this.container.removeInteractive();
        return this;
    }

    destroy() {
        this.container.destroy();
    }

    setBorder(thickness: number, strokeColour: Phaser.Display.Color) {
        this.borderColour = strokeColour;
        this.borderThickness = thickness;
        this.container.setBorder(thickness, strokeColour);
        return this;
    }

    setAlpha(alpha: number) {
        this.container.setAlpha(alpha);
        return this;
    }

    hits(x: number, y: number) {
        return this.container.hits(x, y);
    }
}