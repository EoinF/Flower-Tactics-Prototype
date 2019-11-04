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
        this.children = [this.backgroundImage];
        this.x = ax;
        this.y = ay;
        this.width = width;
        this.height = height;
    }
    
    setBackground(color: Phaser.Display.Color | number, alpha: number = 1) {
        if (typeof(color) === "number") {
            this.backgroundImage.setFillStyle(color, alpha);
        } else {
            this.backgroundImage.setFillStyle(color.color, alpha);
        }
        return this;
    }

    setBorder(thickness: number, color: Phaser.Display.Color | number, alpha: number = 1) {
        if (typeof(color) === "number") {
            this.backgroundImage.setStrokeStyle(thickness, color, alpha);
        } else {
            this.backgroundImage.setStrokeStyle(thickness, color.color, alpha);
        }
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
        return this;
    }

    setInteractive() {
        this.backgroundImage.setInteractive();
        return this;
    }

    on(event: string | symbol, fn: Function, context: any = undefined) {
        this.backgroundImage.on(event, fn, context);
        return this;
    }
}