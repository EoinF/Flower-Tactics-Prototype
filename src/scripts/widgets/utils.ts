import { VerticalAlignment, HorizontalAlignment } from "./constants";

export function getAlignedCoordinates(
    scene: Phaser.Scene, 
    x: number,
    y: number,
    width: number,
    height: number,
    verticalAlignment: VerticalAlignment,
    horizontalAlignment: HorizontalAlignment
) {
    let x2 = x;
    let y2 = y;
    const {
        width: w, height: h
    } = scene.game.canvas;

    if (verticalAlignment == "Bottom") {
        y2 = h - y - height;
    } else if (verticalAlignment == "Middle") {
        y2 = (h - y - height) / 2;
    }
    if (horizontalAlignment == "Right") {
        x2 = w - x - width;
    } else if (horizontalAlignment == "Middle") {
        x2 = (w - x - width) / 2
    }

    return {
        x: x2,
        y: y2
    }
}