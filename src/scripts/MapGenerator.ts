import { Tile } from "./objects/Tile";
import { GameStateData } from "./objects/GameState";
import { River } from "./objects/River";

export interface MapGeneratorConfig {
    numTilesX: number;
    numTilesY: number;
}

const DEFAULT_MAP_CONFIG: MapGeneratorConfig = {
    numTilesX: 10,
    numTilesY: 10
};

export class MapGenerator {
    rnd: Phaser.Math.RandomDataGenerator
    constructor(seed: number) {
        this.rnd = new Phaser.Math.RandomDataGenerator(seed.toString());
    }

    public generateNewMap({
        numTilesX,
        numTilesY
    }: MapGeneratorConfig = DEFAULT_MAP_CONFIG): GameStateData {
        return {
            numTilesX,
            numTilesY,
            tiles: this.generateTiles(numTilesX, numTilesY),
            flowersMap: {},
            mountains: [],
            rivers: this.generateRivers(numTilesX, numTilesY),
            players: {},
            flowerTypes: {},
            seedStatus: {},
            randomNumberGeneratorSeed: "0",
            cloudLayoutSeed: null
        };
    }
    
    private generateTiles(numTilesX: number, numTilesY: number): Tile[] {
        return new Array<Tile | undefined>(numTilesX * numTilesY)
            .fill(undefined)
            .map((_, index) => new Tile(index, 3))
            .map((tile) => {
                tile.soil = {
                    nitrogenContent: 0.09 * this.rnd.frac(),
                    potassiumContent: 0.07 * this.rnd.frac(),
                    phosphorousContent: 0.1 * this.rnd.frac()
                }
                return tile;
            });
    }

    private generateRivers(numTilesX: number, numTilesY: number): River[] {
        return new Array<River | undefined>(numTilesX * numTilesY)
            .fill(undefined)
            .map((_, index) => ({
                x: index % numTilesX,
                y: Math.floor(index / numTilesX)
            }));
    }
}