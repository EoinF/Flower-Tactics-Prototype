import { BaseUIObject } from "../BaseUIObject";
import { TextLabel } from "../TextLabel";
import { COLOURS } from "../constants";
import { UIContainer } from "../UIContainer";
import { RectangleSprite } from "../RectangleSprite";

export abstract class NumberDisplayBase implements BaseUIObject {
    protected mainContainer: UIContainer;
    protected backgroundImage: Phaser.GameObjects.Sprite;
    private startLabel: TextLabel;
    private endLabel: TextLabel;

    x: number;
    y: number;
    width: number;
    height: number;
    originX: number;
    originY: number;
    alpha: number;

    constructor(
        scene: Phaser.Scene, x: number, y: number,
        width: number, height: number,
        colourStart: Phaser.Display.Color, colourEnd: Phaser.Display.Color,
        labels: { startLabelText: string, endLabelText: string }
    ) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.originX = this.originY = 0;

        this.startLabel = new TextLabel(scene, 0, 0, labels.startLabelText, COLOURS.BLACK, true, 10);
        this.endLabel = new TextLabel(scene, 0, 0, labels.endLabelText, COLOURS.BLACK, true, 10);

        this.backgroundImage = new RectangleSprite(scene, 2 + this.startLabel.width, 0,
            width - this.startLabel.width - this.endLabel.width - 4, height, 0.3)
            .setTint(
                colourStart.color, colourEnd.color,
                colourStart.color, colourEnd.color
            ).setOrigin(0, 0);

        this.mainContainer = new UIContainer(scene, x, y, width, height);
        this.mainContainer.addChild(this.startLabel, "Middle");
        this.mainContainer.addChild(this.backgroundImage, "Middle");
        this.mainContainer.addChild(this.endLabel, "Middle", "Right");
    }

    setAlpha (alpha: number) : BaseUIObject {
        this.alpha = alpha;
        this.mainContainer.setAlpha(alpha);
        return this;
    }
    setPosition(x: number, y: number): BaseUIObject {
        this.x = this.originX = x;
        this.y = this.originY = y;
        this.mainContainer.setPosition(x, y);
        return this;
    }
    setVisible (isVisible: boolean) : BaseUIObject {
        this.mainContainer.setVisible(isVisible);
        return this;
    }
    setDepth (depth: number) : BaseUIObject {
        this.mainContainer.setDepth(depth);
        return this;
    }
    destroy () {
        this.mainContainer.destroy();
    };
    getData (key: string): any {
        this.mainContainer.getData(key)
    }
    setData (key: string, value: any) : BaseUIObject {
        this.mainContainer.setData(key, value);
        return this;
    }

    removeInteractive () : BaseUIObject {
        this.mainContainer.setInteractive();
        return this;
    }
}