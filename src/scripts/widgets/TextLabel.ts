import { VerticalAlignment, HorizontalAlignment, COLOURS } from "./constants";
import { getAlignedCoordinates } from "./utils";
import { BaseUIObject } from "./BaseUIObject";

export class TextLabel implements BaseUIObject {
    private scene: Phaser.Scene;
    public textObject: Phaser.GameObjects.Text;
    x: number;
    y: number;
    originX: number;
    originY: number;
    width: number;
    height: number;
    alpha: number;
    depth: number;
    isVisible: boolean;

    constructor(scene: Phaser.Scene,
        x: number, y: number, text: string, 
        colour: Phaser.Display.Color = COLOURS.BLACK, isBold: boolean = false, fontSize: number = 16
    ) {
        this.scene = scene;
        this.textObject = this.scene.add.text(x, y, text, {
            fontFamily: 'Verdana, "Times New Roman", Tahoma, serif', 
            fontStyle: isBold ? 'bold' : '',
            fontSize: `${fontSize}px`
        }).setColor(colour.rgba);
        this.x = x;
        this.y = y;
        
        this.depth = 0;
        this.isVisible = true;

        this.width = this.textObject.width;
        this.height = this.textObject.height;
        this.originX = this.textObject.originX;
        this.originY = this.textObject.originY;
    }

    setText(text: string | string[]) {
        this.textObject.setText(text);
        this.width = this.textObject.width;
        this.height = this.textObject.height;
        return this;
    }

    setPosition(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.textObject.setPosition(x, y);
        return this;
    }
    setDepth(depth: number) {
        this.depth = depth;
        this.textObject.setDepth(depth);
        return this;
    }

    setVisible(isVisible: boolean) {
        this.isVisible = isVisible;
        this.textObject.setVisible(isVisible);
        return this;
    }

    getData(key: string) {
        this.textObject.getData(key);
    }
    
    setData(key: string, value: any) {
        this.textObject.setData(key, value);
        return this;
    }

    setInteractive() {
        this.textObject.setInteractive();
        return this;
    }

    removeInteractive() {
        this.textObject.removeInteractive();
        return this;
    }

    destroy() {
        this.textObject.destroy();
    }

    setAlpha(alpha: number) {
        this.alpha = alpha;
        this.textObject.setAlpha(alpha);
        return this;
    }

    setOrigin(x: number, y: number) {
        this.originX = x;
        this.originY = y;
        this.textObject.setOrigin(x, y);
        return this;
    }
}