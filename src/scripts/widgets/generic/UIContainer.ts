import { VerticalAlignment, HorizontalAlignment, COLOURS } from "./constants";
import { getAlignedCoordinates } from "../utils";
import { BaseUIObject } from "./BaseUIObject";

export class UIContainer implements BaseUIObject {
    private scene: Phaser.Scene;
    public backgroundImage: Phaser.GameObjects.Rectangle;
    originalX: number;
    originalY: number;
    x: number;
    y: number;
    originX: number;
    originY: number;
    width: number;
    height: number;
    alpha: number;
    private verticalAlignment: VerticalAlignment;
    private horizontalAlignment: HorizontalAlignment;
    depth: number;
    strokeThickness: number;
    protected isInteractive: boolean;
    isVisible: boolean;

    children: Array<BaseUIObject | UIContainer>;

    constructor(scene: Phaser.Scene,
        x: number, y: number,
        width: number, height: number,
        verticalAlignment: VerticalAlignment = "Top",
        horizontalAlignment: HorizontalAlignment = "Left"
    ) {
        this.scene = scene;
        this.originalX = this.x = x;
        this.originalY = this.y = y;

        this.verticalAlignment = verticalAlignment;
        this.horizontalAlignment = horizontalAlignment;
        this.originX = this.originY = 0;

        this.alpha = 1;
        this.depth = 0;
        this.width = width;
        this.height = height;
        this.strokeThickness = 0;
        this.isVisible = true;
        this.isInteractive = false;
        this.children = [];

        this.createBackgroundImage();
    }

    createBackgroundImage() {
        const {
            width: w, height: h
        } = this.scene.game.canvas;

        const {x: ax, y: ay} = getAlignedCoordinates(
            this.originalX, this.originalY, this.width, this.height,
             w, h, 
             this.verticalAlignment, this.horizontalAlignment,
             this.originX, this.originY
        );
        this.backgroundImage = this.scene.add.rectangle(this.x, this.y, this.width, this.height, 0xccaaff, 0)
            .setOrigin(0, 0)
            .setDepth(this.depth);
        
        this._setPosition(ax, ay);
    }

    setBackground(color: Phaser.Display.Color) {
        this.backgroundImage.setFillStyle(color.color, color.alphaGL);
        return this;
    }

    setBorder(thickness: number, color: Phaser.Display.Color) {
        this.strokeThickness = thickness;
        this.backgroundImage.setStrokeStyle(thickness, color.color, color.alphaGL);
        return this;
    }

    removeChild(childToDelete: BaseUIObject): BaseUIObject {
        const index = this.children.findIndex(child => childToDelete === child);
        this.children.splice(index, 1);
        return childToDelete;
    }

    addChild(child: BaseUIObject,
        verticalAlignment: VerticalAlignment = "Top",
        horizontalAlignment: HorizontalAlignment = "Left"
    ) {
        const {x: ax, y: ay} = getAlignedCoordinates(
            child.x, child.y, child.width, child.height,
            this.width, this.height, verticalAlignment, horizontalAlignment,
            child.originX, child.originY
        );

        this.children.push(child);
        child.setPosition(ax + this.x, ay + this.y);
        child.setAlpha(this.alpha);
        child.setDepth(this.depth + 1);
        child.setVisible(this.isVisible);
        return this;
    }
    
    private _setPosition(x: number, y: number) {
        const diffX = x - this.x;
        const diffY = y - this.y;
        this.x = x;
        this.y = y;
        this.backgroundImage.setPosition(this.backgroundImage.x + diffX, this.backgroundImage.y + diffY);
        this.children.forEach(child => {
            child.setPosition(child.x + diffX, child.y + diffY);
        });
    }

    setPosition(x: number, y: number) {
        this.originalX = x;
        this.originalY = y;
        this._setPosition(x, y);
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
        this.isInteractive = true;
        this.backgroundImage.setInteractive();
        return this;
    }

    removeInteractive() {
        this.isInteractive = false;
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
        return this;
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

    setAlpha(alpha: number) {
        this.alpha = alpha;
        this.backgroundImage.setAlpha(alpha);
        this.children.forEach(child => child.setAlpha(alpha));
        return this;
    }
}