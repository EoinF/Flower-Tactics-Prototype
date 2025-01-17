import { VerticalAlignment, HorizontalAlignment } from "../types";
import { COLOURS } from "../constants";

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

export function getPlayerColour(playerId: string | undefined): Phaser.Display.Color {
    if (playerId === "1") {
        return COLOURS.PLAYER_RED;
    } else if (playerId === "2") {
        return COLOURS.PLAYER_BLUE;
    } else {
        return COLOURS.BLACK;
    }
}