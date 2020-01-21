import { UIObject, BaseUIObject } from "../UIObject";
import { TextLabel } from "../TextLabel";
import { UIContainer } from "../UIContainer";
import { RectangleSprite } from "../RectangleSprite";
import { COLOURS } from "../../../constants";

export abstract class NumberDisplayBase extends BaseUIObject {
    protected backgroundImage: Phaser.GameObjects.Sprite;
    private startLabel: TextLabel;
    private endLabel: TextLabel;

    constructor(
        scene: Phaser.Scene, x: number, y: number,
        width: number, height: number,
        colourStart: Phaser.Display.Color, colourEnd: Phaser.Display.Color,
        labels: { startLabelText: string, endLabelText: string }
    ) {
        super(scene, x, y, width, height);
        this.startLabel = new TextLabel(scene, 0, 0, labels.startLabelText, COLOURS.BLACK, { isBold: true, fontSize: 10});
        this.endLabel = new TextLabel(scene, 0, 0, labels.endLabelText, COLOURS.BLACK, {isBold: true, fontSize: 10});

        this.backgroundImage = new RectangleSprite(scene, 2 + this.startLabel.width, 0,
            width - this.startLabel.width - this.endLabel.width - 4, height, 0.75)
            .setTint(
                colourStart.color, colourEnd.color,
                colourStart.color, colourEnd.color
            ).setOrigin(0, 0);

        this.container.addChild(this.startLabel, "Middle");
        this.container.addChild(this.backgroundImage, "Middle");
        this.container.addChild(this.endLabel, "Middle", "Right");
    }
}