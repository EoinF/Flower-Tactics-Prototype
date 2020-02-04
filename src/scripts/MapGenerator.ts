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
            flowersMap: {
                "0": {
                    growth: 2,
                    type: "1",
                    x: 13,
                    y: 0,
                }
            },
            mountains: [],
            rivers: this.generateRivers(numTilesX, numTilesY),
            players: {
                "1": {
                    controlledBy: "Human",
                    autoReplantTileMap: {},
                    cloudOwned: null,
                    flowers: ["0"],
                    seedsOwned: ["1"]
                }
            },
            flowerTypes: {
                "1": {
                    name: "Test flower",
                    nitrogen: 2,
                    potassium: 2,
                    phosphorous: 2,
                    seedProductionRate: 99,
                    tenacity: 50,
                    turnsUntilDead: 3,
                    turnsUntilGrown: 3,
                    type: "1"
                }
            },
            seedStatus: {
                "1": {
                    progress: 0,
                    quantity: 100,
                    type: "1"
                }
            },
            flowerAugmentations: {},
            randomNumberGeneratorSeed: "0",
            clouds: {}
        };
    }
    
    private generateTiles(numTilesX: number, numTilesY: number): Tile[] {
        let n = 1;
        let p = 1;
        let k = 1;
        return new Array<Tile | undefined>(numTilesX * numTilesY)
            .fill(undefined)
            .map((_, index) => new Tile(index))
            .map((tile) => {
                tile.soil = {
                    nitrogenContent: n,
                    potassiumContent: p,
                    phosphorousContent: k
                }
                n++;
                if (n > 3) {
                    n = 1;
                    p++;
                    if (p > 3) {
                        k++;
                        p = 1;
                        if (k > 3) {
                            k = 1;
                        }
                    }
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
            }))
            .filter(() => this.rnd.integerInRange(0, 3) == 2);
    }
}