import { UIObject } from "./UIObject";
import { COLOURS } from "../../constants";

interface TextLabelConfig {
    isBold: boolean;
    maxWidth: number | null;
    fontSize: number;
    strokeThickness: number;
    strokeColour: Phaser.Display.Color;
}

export class TextLabel implements UIObject {
    private scene: Phaser.Scene;
    private textObject: Phaser.GameObjects.Text;
    private depthOffset: number;
    x: number;
    y: number;
    originX: number;
    originY: number;
    width: number;
    height: number;
    alpha: number;
    depth: number;
    visible: boolean;

    constructor(scene: Phaser.Scene,
        x: number, y: number, text: string | string[],
        colour: Phaser.Display.Color = COLOURS.BLACK, 
        {
            isBold = false,
            maxWidth = null,
            fontSize = 16,
            strokeThickness = 0,
            strokeColour = COLOURS.BLACK
        }: Partial<TextLabelConfig> = {
            isBold: false,
            maxWidth: null,
            fontSize: 16,
            strokeThickness: 0,
            strokeColour: COLOURS.BLACK
        }
    ) {
        this.scene = scene;
        const config = {
            fontFamily: 'Verdana, "Times New Roman", Tahoma, serif',
            fontStyle: isBold ? 'bold' : '',
            fontSize: `${fontSize}px`,
            strokeThickness,
            stroke: strokeColour,
            lineSpacing: 4,
            align: 'center',
            wordWrap: maxWidth != null ? { width: maxWidth, useAdvancedWrap: true } : {}
        }
        this.textObject = this.scene.add.text(x, y, text, config)
            .setColor(colour.rgba);
        this.x = x;
        this.y = y;
        
        this.depth = 0;
        this.depthOffset = 0;
        this.visible = true;

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

    setDepthOffset(depthOffset: number) {
        this.depthOffset = depthOffset;
        return this.setDepth(this.depth);
    }

    setDepth(depth: number) {
        this.depth = depth + this.depthOffset;
        this.textObject.setDepth(depth + this.depthOffset);
        return this;
    }

    setVisible(isVisible: boolean) {
        this.visible = isVisible;
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

    setColor(colour: Phaser.Display.Color) {
        this.textObject.setColor(colour.rgba);
        return this;
    }
}