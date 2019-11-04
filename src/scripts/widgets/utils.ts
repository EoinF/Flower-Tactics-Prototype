import { VerticalAlignment, HorizontalAlignment } from "./constants";

export function getAlignedCoordinates(
    x: number,
    y: number,
    width: number,
    height: number,
    parentWidth: number,
    parentHeight: number,
    verticalAlignment: VerticalAlignment,
    horizontalAlignment: HorizontalAlignment
) {
    let x2 = x;
    let y2 = y;

    if (verticalAlignment == "Bottom") {
        y2 = parentHeight - y - height;
    } else if (verticalAlignment == "Middle") {
        y2 = (parentHeight - y - height) / 2;
    }
    if (horizontalAlignment == "Right") {
        x2 = parentWidth - x - width;
    } else if (horizontalAlignment == "Middle") {
        x2 = (parentWidth - x - width) / 2
    }

    return {
        x: x2,
        y: y2
    }
}