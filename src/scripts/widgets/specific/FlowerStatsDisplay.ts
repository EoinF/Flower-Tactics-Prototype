import { UIObject } from "../generic/UIObject";
import { COLOURS, NITROGEN_VALUE_RANGE, PHOSPHOROUS_VALUE_RANGE, POTASSIUM_VALUE_RANGE } from "../../constants";
import { TextLabel } from "../generic/TextLabel";
import { UIContainer } from "../generic/UIContainer";
import { FlexUIContainer } from "../generic/FlexUIContainer";
import { FlowerType } from "../../objects/FlowerType";
import { NumberPointDisplay } from "../generic/NumberDisplay/NumberPointDisplay";

export class FlowerStatsDisplay implements UIObject {
    private nitrogenDisplay: NumberPointDisplay;
    private phosphorousDisplay: NumberPointDisplay;
    private potassiumDisplay: NumberPointDisplay;

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
    active: boolean;

    protected container: UIContainer;

    constructor(scene: Phaser.Scene, x: number, y: number, displayWidth: number, displayHeight: number) {
        this.container = new FlexUIContainer(scene, x, y, "auto", "grow");

        this.x = x;
        this.y = y;
        this.originX = 0;
        this.originY = 0;
        this.alpha = 1;
        this.borderThickness = 0;

        // Labels
        const nitrogenLabel = new TextLabel(scene, 4, 0, "Nitrogen: ", COLOURS.BLACK, {fontSize: 12});
        const phosphorousLabel = new TextLabel(scene, 4, 0, "Phosphorous: ", COLOURS.BLACK, { fontSize: 12 });
        const potassiumLabel = new TextLabel(scene, 4, 0, "Potassium: ", COLOURS.BLACK, {fontSize:12});

        const labelColumnWidth = Math.max(nitrogenLabel.width, phosphorousLabel.width, potassiumLabel.width);

        // Nitrogen section
        this.nitrogenDisplay = new NumberPointDisplay(scene, 2 + labelColumnWidth, 2, displayWidth, displayHeight,
            COLOURS.WHITE, COLOURS.BLACK,
            { startLabelText: "0%", endLabelText: "30%" },
            NITROGEN_VALUE_RANGE
        );
        const nitrogenSection = new UIContainer(scene, 0, 0, labelColumnWidth + displayWidth + 4, displayHeight);
        nitrogenSection.addChild(nitrogenLabel, "Middle");
        nitrogenSection.addChild(this.nitrogenDisplay, "Middle");

        // Phosphorous section
        this.phosphorousDisplay = new NumberPointDisplay(scene, 2 + labelColumnWidth, 2, displayWidth, displayHeight,
            COLOURS.GREEN, COLOURS.RED,
            { startLabelText: "0%", endLabelText: "30%" },
            PHOSPHOROUS_VALUE_RANGE
        );
        const phosphorousSection = new UIContainer(scene, 0, 2, labelColumnWidth + displayWidth + 4, displayHeight);
        phosphorousSection.addChild(phosphorousLabel, "Middle");
        phosphorousSection.addChild(this.phosphorousDisplay, "Middle");

        // Potassium section
        this.potassiumDisplay = new NumberPointDisplay(scene, 2 + labelColumnWidth, 2, displayWidth, displayHeight,
            COLOURS.GRAY, COLOURS.BLUE,
            { startLabelText: "0%", endLabelText: "30%" },
            POTASSIUM_VALUE_RANGE
        );
        const potassiumSection = new UIContainer(scene, 0, 0, labelColumnWidth + displayWidth + 4, displayHeight);
        potassiumSection.addChild(potassiumLabel, "Middle");
        potassiumSection.addChild(this.potassiumDisplay, "Middle");

        this.container.addChild(nitrogenSection);
        this.container.addChild(phosphorousSection);
        this.container.addChild(potassiumSection);

        this.width = this.container.width;
        this.height = this.container.height;
        this.setVisible(false);
    }
    
    setValues(flowerTypeDetails: FlowerType) {
        this.nitrogenDisplay.setValue(flowerTypeDetails.nitrogen);
        this.phosphorousDisplay.setValue(flowerTypeDetails.phosphorous);
        this.potassiumDisplay.setValue(flowerTypeDetails.potassium);
        this.setVisible(true);
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

    setScale(scaleX: number, scaleY: number | undefined = undefined) {
        this.container.setScale(scaleX, scaleY);
        return this;
    }

    setActive(isActive: boolean) {
        this.active = isActive;
        this.container.setActive(isActive);
        return this;
    }

    hits(x: number, y: number) {
        return this.container.hits(x, y);
    }
}