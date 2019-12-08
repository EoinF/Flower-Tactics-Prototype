import { UIContainer } from "./UIContainer";
import { VerticalAlignment, HorizontalAlignment } from "./constants";
import { BaseUIObject } from "./BaseUIObject";
import { getAlignedCoordinates } from "../utils";

type FlexType = "auto" | "grow" | "manual";
export class FlexUIContainer extends UIContainer {
    private widthFlexType: FlexType;
    private heightFlexType: FlexType;

    constructor(scene: Phaser.Scene,
        x: number, y: number,
        width: number | "auto" | "grow" = "auto", height: number | "auto" | "grow" = "auto",
        verticalAlignment: VerticalAlignment = "Top", 
        horizontalAlignment: HorizontalAlignment = "Left"
    ) {
        const _width = width === "auto" || width === "grow" ? 0 : width;
        const _height = height === "auto" || height === "grow" ? 0 : height;
        
        super(scene, x, y, _width, _height, verticalAlignment, horizontalAlignment);
        this.widthFlexType =  typeof(width) === "number" ? "manual": width;
        this.heightFlexType = typeof(height) === "number" ? "manual": height;
    }

    
    addChild(child: BaseUIObject,
        verticalAlignment: VerticalAlignment = "Top",
        horizontalAlignment: HorizontalAlignment = "Left"
    ) {
        let oldWidth = 0;
        let oldHeight = 0;
        if (this.widthFlexType === "grow") {
            oldWidth = this.width;
            this.width += child.width + 2 * child.x;
        } else if (this.widthFlexType === "auto") {
            this.width = Math.max(this.width, child.width);
        }
        if (this.heightFlexType === "grow") {
            oldHeight = this.height;
            this.height += child.height + 2 * child.y;
        } else if (this.heightFlexType === "auto") {
            this.height = Math.max(this.height, child.height);
        }

        const oldImage = this.backgroundImage;
        this.createBackgroundImage();
        this.backgroundImage
            .setFillStyle(oldImage.fillColor, oldImage.fillAlpha)
            .setStrokeStyle(this.strokeThickness, oldImage.strokeColor, oldImage.strokeAlpha)
            .setAlpha(oldImage.alpha)
        if (this.isInteractive)
            this.backgroundImage.setInteractive();
        oldImage.destroy();

        const {x: ax, y: ay} = getAlignedCoordinates(
            child.x, child.y, child.width, child.height,
            this.width, this.height, verticalAlignment, horizontalAlignment,
            child.originX, child.originY
        );

        this.children.push(child);
        child.setPosition(ax + this.x + oldWidth, ay + this.y + oldHeight);
        child.setAlpha(this.alpha);
        child.setDepth(this.depth + 1);
        child.setVisible(this.isVisible);
        return this;
    }

}