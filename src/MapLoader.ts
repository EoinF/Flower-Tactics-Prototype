import { SoilColourConverter } from "./scripts/SoilColourConverter";
import { Tile } from "./scripts/objects/Tile";
import { GameState } from "./scripts/GameState";
import { Flower } from "./scripts/objects/Flower";

export interface ObjectData {
    flowers: Array<Flower>;
}

export class MapLoader {
    soilColourConverter: SoilColourConverter;
    constructor(soilColourConverter: SoilColourConverter) {
        this.soilColourConverter = soilColourConverter;
    }
    public loadMap(imageData: ImageData, objectData: ObjectData): GameState {
        const {tiles, numTilesX, numTilesY} = this.loadTiles(imageData);
        return {
            numTilesX,
            numTilesY,
            tiles,
            ...objectData
        }
    }

    private loadTiles(imageData: ImageData) {
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
        return {tiles, numTilesX, numTilesY};
    }
}