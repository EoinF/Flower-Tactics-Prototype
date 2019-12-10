import { VerticalAlignment, HorizontalAlignment } from "./generic/constants";

export function getAlignedCoordinates(
    x: number,
    y: number,
    width: number,
    height: number,
    parentWidth: number,
    parentHeight: number,
    verticalAlignment: VerticalAlignment,
    horizontalAlignment: HorizontalAlignment,
    originX: number = 0.5,
    originY: number = 0.5
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
        x: x2 + (width * originX),
        y: y2 + (height * originY)
    }
}

export function indexToMapCoordinates(index: number, numTilesX: number) {
    return { 
      x: (index % numTilesX),
      y: Math.floor(index / numTilesX)
    };
}