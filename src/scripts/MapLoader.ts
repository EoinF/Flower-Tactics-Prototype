import { SoilColourConverter } from "./SoilColourConverter";
import { Tile } from "./objects/Tile";
import { GameStateData } from "./objects/GameState";
import { Flower } from "./objects/Flower";
import { Mountain } from "./objects/Mountain";
import { River } from "./objects/River";
import { RGBtoHSL } from "./extensions";
import { FlowerType } from "./objects/FlowerType";
import { StringMap } from "./types";
import { Player } from "./objects/Player";
import { SeedStatus } from "./objects/SeedStatus";
import { FlowerAugmentation } from "./objects/FlowerAugmentation";
import { Cloud } from "./objects/Cloud";

export interface ObjectData {
    players: StringMap<Player>;
    flowersMap: StringMap<Flower>;
    seedStatus: StringMap<SeedStatus>;
    clouds: StringMap<Cloud>;

    mountains: Mountain[];
    rivers: River[];
    flowerTypes: StringMap<FlowerType>;
    flowerAugmentations: StringMap<FlowerAugmentation[]>;
    randomNumberGeneratorSeed: string;
    rainfallTiles: number[];
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
                const colour = RGBtoHSL(
                    imageData.data[(index * 4)],
                    imageData.data[(index * 4) + 1],
                    imageData.data[(index * 4) + 2]
                );
                tile.soil = this.soilColourConverter.colourToSoil(colour);
                return tile;
            });
        return {tiles, numTilesX, numTilesY};
    }
}