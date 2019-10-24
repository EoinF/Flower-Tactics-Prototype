import { SoilColourConverter } from "./SoilColourConverter";
import { Tile } from "./objects/Tile";
import { GameStateData } from "./GameState";
import { Flower } from "./objects/Flower";
import { Mountain } from "./objects/Mountain";
import { River } from "./objects/River";
import { RGBtoHSL } from "./extensions";
import { FlowerType } from "./objects/FlowerType";
import { StringMap } from "./types";

export interface ObjectData {
    flowers: Flower[];
    mountains: Mountain[];
    rivers: River[];
    flowerTypes: StringMap<FlowerType>
}

export class MapLoader {
    soilColourConverter: SoilColourConverter;
    constructor(soilColourConverter: SoilColourConverter) {
        this.soilColourConverter = soilColourConverter;
    }
    public loadMap(imageData: ImageData, objectData: ObjectData): GameStateData {
        const {tiles, numTilesX, numTilesY} = this.loadTiles(imageData, objectData);
        return {
            numTilesX,
            numTilesY,
            tiles,
            ...objectData
        }
    }

    private loadTiles(imageData: ImageData, objectData: ObjectData) {
        const numTilesX = imageData.width;
        const numTilesY = imageData.height;

        const tiles = new Array<Tile | undefined>(numTilesX * numTilesY)
            .fill(undefined)
            .map((_, index) => new Tile(index))
            .map((tile, index) => {
                const x = index % numTilesX;
                const y = Math.floor(index / numTilesY);
                const colour = RGBtoHSL(
                    imageData.data[(index * 4)],
                    imageData.data[(index * 4) + 1],
                    imageData.data[(index * 4) + 2]
                );
                tile.soil = this.soilColourConverter.colourToSoil(colour);
                tile.flowers = objectData.flowers.filter(flower => flower.x == x && flower.y == y);
                return tile;
            });
        return {tiles, numTilesX, numTilesY};
    }
}