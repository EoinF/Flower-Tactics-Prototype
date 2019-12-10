import { Soil } from "../../objects/Tile";
import { ImageButton } from "../generic/ImageButton";
import { SoilColourConverter } from "../../SoilColourConverter";
import { COLOURS } from "../generic/constants";
import { indexToMapCoordinates } from "../utils";
import { BaseButton } from "../generic/BaseButton";
import { UIContainer } from "../generic/UIContainer";
import { distinctUntilChanged, pairwise } from "rxjs/operators";
import { ClickableWidget } from "../generic/ClickableWidget";

type TilePlacementState = "blocked" | "allowed" | "n/a"

export class TileWidget extends ClickableWidget {
    private soilColourConverter: SoilColourConverter;
    private image: Phaser.GameObjects.Image;

    private isHovering: boolean;
    private placementState: TilePlacementState;
    readonly tileX: number;
    readonly tileY: number;

    private soilColour: Phaser.Display.Color;

    constructor(scene: Phaser.Scene, tileIndex: number, numTilesX: number, soil: Soil, soilColourConverter: SoilColourConverter) {
        const {x, y} = indexToMapCoordinates(tileIndex, numTilesX);
        super(scene, x * 48 - 24, y * 48 - 24, 48, 48);
        this.soilColourConverter = soilColourConverter;
        this.image =  scene.add.image(0, 0, "blank-tile")
        this.container.addChild(this.image, "Middle", "Middle")
        this.soilColour = this.soilColourConverter.soilToColour(soil);
        this.tileX = x;
        this.tileY = y;

        this.isHovering = false;
        this.placementState = "n/a";
        this.updateDisplay();
    }

    setPlacementState(state: TilePlacementState) {
        this.placementState = state;
        this.updateDisplay();
    }

    setIsHovering(isHovering: boolean) {
        this.isHovering = isHovering;
        this.updateDisplay();
    }

    private updateDisplay() {
        let tintColour = this.soilColour;
        if (this.isHovering) {
            tintColour = COLOURS.PURPLE_200;
        } else {
            switch(this.placementState) {
                case "allowed":
                    tintColour = COLOURS.GREEN;
                    break;
                case "blocked":
                    tintColour = COLOURS.RED;
                    break;
            }
        }
        
        const finalColour = Phaser.Display.Color.ObjectToColor(
            Phaser.Display.Color.Interpolate.ColorWithColor(this.soilColour, tintColour, 100, 50)
        );
        this.image.setTint(finalColour.color);
    }

    setSoil(soil: Soil) {
        this.soilColour = this.soilColourConverter.soilToColour(soil);
        this.updateDisplay();
    }
}