import { UIContainer } from "./UIContainer";
import { HorizontalAlignment, VerticalAlignment } from "../../types";

export interface UIObject {
    x: number;
    y: number;
    width: number;
    height: number;
    originX: number;
    originY: number;
    alpha: number;
    visible: boolean;
    active: boolean;
    setActive: (isActive: boolean) => UIObject;
    setAlpha: (alpha: number) => UIObject;
    setPosition: (x: number, y: number) => UIObject;
    setVisible: (isVisible: boolean) => UIObject;
    setDepth: (depth: number) => UIObject;
    destroy: () => void;
    getData: (key: string) => any;
    setData: (key: string, value: any) => UIObject;
    setScale: (scaleX: number, scaleY: number | undefined) => UIObject;

    removeInteractive: () => UIObject;
}

export class BaseUIObject implements UIObject {
    x: number;
    y: number;
    width: number;
    height: number;

    originX: number;
    originY: number;

    active: boolean;
    alpha: number;
    borderThickness: number;
    borderColour: Phaser.Display.Color;
    visible: boolean;

    protected container: UIContainer;
    
    constructor(scene: Phaser.Scene, 
        x: number, y: number,
        width: number, height: number,
        verticalAlignment: VerticalAlignment = "Top",
        horizontalAlignment: HorizontalAlignment = "Left") {
        
        this.container = new UIContainer(scene, x, y, width, height, verticalAlignment, horizontalAlignment);

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.originX = 0;
        this.originY = 0;
        this.alpha = 1;
        this.borderThickness = 0;
        this.visible = true;
        this.active = true;
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
    setActive(isActive: boolean) {
        this.active = isActive;
        this.container.setActive(isActive);
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
        this.alpha = alpha;
        this.container.setAlpha(alpha);
        return this;
    }

    hits(x: number, y: number) {
        return this.container.hits(x, y);
    }
    
    setScale(scaleX: number, scaleY: number | undefined = undefined): UIObject {
        this.container.setScale(scaleX, scaleY);
        return this;
    }
}