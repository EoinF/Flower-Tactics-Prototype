import { BaseUIObject, UIObject } from "../generic/UIObject";
import { CloudLayout } from "../../controllers/HeldObjectController";
import { FlexUIContainer } from "../generic/FlexUIContainer";
import { COLOURS } from "../../constants";

export class HeldCloudsWidget implements UIObject {
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
    private container: FlexUIContainer;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        this.container = new FlexUIContainer(scene, x - 24, y - 24, 48 * 3, 48 * 3)
            .setBorder(1, COLOURS.withAlpha(COLOURS.BLACK, 0.2))
            .setBackground(COLOURS.withAlpha(COLOURS.TURQUOISE, 0.2));

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++)
            this.container.addChild(scene.add.image(i * 48, j * 48, 'cloud'));
        }
        
        this.x = x - 24;
        this.y = y - 24;
        this.width = this.container.width;
        this.height = this.container.height;
        this.originX = 0;
        this.originY = 0;
        this.alpha = 1;
        this.borderThickness = 0;
        this.visible = true;
    }

    setCloudLayout(cloudLayout: CloudLayout) {
        for (let i = 0; i < cloudLayout.length; i++) {
            this.container.children[i].setVisible(cloudLayout[i]);
        }
    }
    
    setPosition (x: number, y: number) {
        this.x = x - 24;
        this.y = y - 24;
        this.container.setPosition(this.x, this.y);
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