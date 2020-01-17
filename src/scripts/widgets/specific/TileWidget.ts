import { Soil } from "../../objects/Tile";
import { SoilColourConverter } from "../../SoilColourConverter";
import { indexToMapCoordinates } from "../utils";
import { ClickableWidget } from "../generic/ClickableWidget";
import { COLOURS } from "../../constants";

type TilePlacementState = "blocked" | "allowed" | "n/a"
type TileViabilityState = "viable" | "unviable" | "n/a"

export class TileWidget extends ClickableWidget {
    private soilColourConverter: SoilColourConverter;
    private soilImage: Phaser.GameObjects.Image;
    private viableSprite: Phaser.GameObjects.Image;
    private waterImage: Phaser.GameObjects.Image;

    private isHovering: boolean;
    private viabilityState: TileViabilityState;
    private placementState: TilePlacementState;
    readonly tileX: number;
    readonly tileY: number;
    readonly tileIndex: number;

    private soilColour: Phaser.Display.Color;
    private waterContent: number;

    constructor(scene: Phaser.Scene, tileIndex: number, numTilesX: number, soil: Soil, waterContent: number, soilColourConverter: SoilColourConverter) {
        const {x: tileX, y: tileY} = indexToMapCoordinates(tileIndex, numTilesX);
        const x = tileX * 48;
        const y = tileY * 48
        super(scene, x - 24, y - 24, 48, 48);

        this.tileX = tileX;
        this.tileY = tileY;
        this.tileIndex = tileIndex;
        this.soilColourConverter = soilColourConverter;

        this.container.setDepth(this.container.depth, "auto");
        this.soilImage =  scene.add.image(0, 0, "blank-tile");
        this.waterImage = scene.add.image(0, 0, "droplet")
            .setDepth(7);

        this.viableSprite = scene.add.image(x, y, "tile-viable")
            .setTint(COLOURS.LIGHT_YELLOW.color)
            .setVisible(false)
            .setDepth(1);

        this.container.addChild(this.soilImage, "Middle", "Middle");
        this.container.addChild(this.waterImage, "Bottom", "Right");

        this.isHovering = false;
        this.placementState = "n/a";

        this.setTileState(soil, waterContent);
    }

    setTileState(soil: Soil, waterContent: number) {
        this.soilColour = this.soilColourConverter.soilToColour(soil);
        this.waterContent = waterContent;
        this.waterImage.setVisible(this.waterContent > 0)
            .setScale(0.5);

        this.updateDisplay();
    }

    setPlacementState(placementState: TilePlacementState, viabilityState: TileViabilityState) {
        this.placementState = placementState;
        this.viabilityState = viabilityState;
        this.updateDisplay();
    }
    

    setIsHovering(isHovering: boolean) {
        this.isHovering = isHovering;
        this.updateDisplay();
    }

    private updateDisplay() {
        let tintColour = this.soilColour;
        let colourRatio = 70;
        if (this.isHovering) {
            tintColour = COLOURS.PURPLE_200;
        } else {
            switch(this.placementState) {
                case "allowed":
                    tintColour = COLOURS.TURQUOISE;
                    break;
                case "blocked":
                    tintColour = COLOURS.PINK_100;
                    break;
            }
        }
        
        const finalColour = Phaser.Display.Color.ObjectToColor(
            Phaser.Display.Color.Interpolate.ColorWithColor(this.soilColour, tintColour, 100, colourRatio)
        );
        this.soilImage.setTint(finalColour.color);
        this.viableSprite.setVisible(this.viabilityState === "viable");
    }
}