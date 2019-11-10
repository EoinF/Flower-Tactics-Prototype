import { VerticalAlignment, HorizontalAlignment } from "./constants";
import { getAlignedCoordinates } from "./utils";
import { BaseUIObject } from "./BaseUIObject";

export class UIContainer implements BaseUIObject {
    protected backgroundImage: Phaser.GameObjects.Rectangle;
    x: number;
    y: number;
    width: number;
    height: number;
    depth: number;
    isVisible: boolean;

    children: Array<BaseUIObject | UIContainer>;

    constructor(scene: Phaser.Scene,
        x: number, y: number,
        width: number, height: number,
        verticalAlignment: VerticalAlignment = "Top", 
        horizontalAlignment: HorizontalAlignment = "Left"
    ) {
        const {
            width: w, height: h
        } = scene.game.canvas;

        const {x: ax, y: ay} = getAlignedCoordinates(x, y, width, height, w, h, verticalAlignment, horizontalAlignment);
        this.backgroundImage = scene.add.rectangle(ax, ay, width, height, 0xccaaff, 0)
            .setOrigin(0, 0)
            .setDepth(0)

        this.depth = 0;
        this.isVisible = true;
        this.children = [];
        this.x = ax;
        this.y = ay;
        this.width = width;
        this.height = height;
    }
    
    setBackground(color: Phaser.Display.Color) {
        this.backgroundImage.setFillStyle(color.color, color.alphaGL);
        return this;
    }

    setBorder(thickness: number, color: Phaser.Display.Color) {
        this.backgroundImage.setStrokeStyle(thickness, color.color, color.alphaGL);
        return this;
    }

    addChild(child: BaseUIObject | UIContainer,
        verticalAlignment: VerticalAlignment = "Top",
        horizontalAlignment: HorizontalAlignment = "Left"
    ) {
        this.children.push(child);

        const {x: ax, y: ay} = getAlignedCoordinates(child.x, child.y, child.width, child.height, this.width, this.height, verticalAlignment, horizontalAlignment);

        child.setPosition(ax + this.x, ay + this.y);
        child.setDepth(this.depth + 1);
        child.setVisible(this.isVisible);
        return this;
    }

    setPosition(x: number, y: number) {
        const diffX = x - this.x;
        const diffY = y - this.y;
        this.x = x;
        this.y = y;
        this.backgroundImage.setPosition(this.backgroundImage.x + diffX, this.backgroundImage.y + diffY);
        this.children.forEach(child => {
            child.setPosition(child.x + diffX, child.y + diffY);
        });
        return this;
    }

    setDepth(depth: number) {
        this.depth = depth;
        this.children.forEach(child => child.setDepth(this.depth + 1));
        this.backgroundImage.setDepth(this.depth);
        return this;
    }

    setVisible(isVisible: boolean) {
        this.isVisible = isVisible;
        this.children.forEach(child => child.setVisible(this.isVisible));
        this.backgroundImage.setVisible(this.isVisible);
        return this;
    }

    getData(key: string) {
        this.backgroundImage.getData(key);
    }
    
    setData(key: string, value: any) {
        this.backgroundImage.setData(key, value);
        return this;
    }

    setInteractive() {
        this.backgroundImage.setInteractive();
        return this;
    }

    removeInteractive() {
        this.backgroundImage.removeInteractive();
        return this;
    }

    destroy() {
        this.clear();
        this.backgroundImage.destroy();
    }

    clear() {
        this.children
            .forEach(child => child.destroy());
        this.children = [];
    }

    on(event: string | symbol, fn: Function, context: any = undefined) {
        this.backgroundImage.on(event, fn, context);
        return this;
    }

    hits(x: number, y: number): boolean {
        return (
            x >= this.x &&
            x < this.x + this.width &&
            y >= this.y &&
            y < this.y + this.height
        );
    }
}