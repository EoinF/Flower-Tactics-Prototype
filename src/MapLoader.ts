import { SoilColourConverter } from "./scripts/SoilColourConverter";
import { Tile, DEFAULT_SOIL } from "./scripts/objects/Tile";
import { GameState } from "./scripts/GameState";

export class MapLoader {
    soilColourConverter: SoilColourConverter;
    constructor(soilColourConverter: SoilColourConverter) {
        this.soilColourConverter = soilColourConverter;
    }
    public loadMap(imageData: ImageData): GameState {
        const numTilesX = imageData.width;
        const numTilesY = imageData.height;

        const tiles = new Array<Tile | undefined>(numTilesX * numTilesY)
            .fill(undefined)
            .map(() => new Tile())
            .map((tile, index) => {
                const colour = new Phaser.Display.Color(
                    imageData.data[(index * 4)],
                    imageData.data[(index * 4) + 1],
                    imageData.data[(index * 4) + 2],
                    imageData.data[(index * 4) + 3]
                );
                tile.soil = this.soilColourConverter.colourToSoil(colour);
                return tile;
            });
        return {
            numTilesX,
            numTilesY,
            tiles
        }
    }
}