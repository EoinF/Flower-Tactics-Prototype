import { Tile } from "./objects/Tile";
import { GameStateData } from "./objects/GameState";
import { River } from "./objects/River";
import { Mountain } from "./objects/Mountain";
import { indexToMapCoordinates } from "./widgets/utils";

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
    constructor(seed?: number) {
        this.rnd = new Phaser.Math.RandomDataGenerator(seed ? seed.toString(): undefined);
    }

    public generateNewMap({
        numTilesX,
        numTilesY
    }: MapGeneratorConfig = DEFAULT_MAP_CONFIG): GameStateData {
        let mountains = this.generateMountains(numTilesX, numTilesY);
        const rivers = this.generateRivers(numTilesX, numTilesY);
        // Prevent overlap of mountains and rivers
        mountains = mountains.filter(mountain => rivers.every(river => river.x !== mountain.x || river.y !== mountain.y));

        return {
            mapName: "Generated",
            numTilesX,
            numTilesY,
            gameId: null,
            tiles: this.generateTiles(numTilesX, numTilesY),
            flowersMap: {
                "0": {
                    growth: 2,
                    type: "1",
                    x: 13,
                    y: 2,
                },
                "1": {
                    growth: 2,
                    type: "2",
                    x: 2,
                    y: 13,
                }
            },
            mountains,
            rivers,
            players: {
                "1": {
                    controlledBy: "Human",
                    autoReplantTileMap: {},
                    cloudOwned: null,
                    flowers: ["0"],
                    seedsOwned: ["1"]
                },
                "2": {
                    controlledBy: "AI_2",
                    autoReplantTileMap: {},
                    cloudOwned: null,
                    flowers: ["1"],
                    seedsOwned: ["2"]
                }
            },
            flowerTypes: {
                "1": {
                    name: "Tulip",
                    nitrogen: 2,
                    potassium: 2,
                    phosphorous: 1,
                    seedProductionRate: 35,
                    tenacity: 0,
                    turnsUntilDead: 4,
                    turnsUntilGrown: 3,
                    type: "1"
                },
                "2": {
                    name: "Elderflower",
                    nitrogen: 2,
                    potassium: 2,
                    phosphorous: 1,
                    seedProductionRate: 35,
                    tenacity: 0,
                    turnsUntilDead: 4,
                    turnsUntilGrown: 3,
                    type: "2"
                }
            },
            seedStatus: {
                "1": {
                    progress: 0,
                    quantity: 5,
                    type: "1"
                },
                "2": {
                    progress: 0,
                    quantity: 5,
                    type: "2"
                }
            },
            flowerAugmentations: {},
            randomNumberGeneratorSeed: "0",
            clouds: {}
        };
    }
    
    private generateTiles(numTilesX: number, numTilesY: number): Tile[] {
        const centrePoint = {x: (numTilesX - 1) / 2, y: (numTilesY - 1) / 2 };
        const radius = (numTilesX / 2) + (numTilesY / 2) / 2;

        const nBreakpoints = [3, 3, 3, 2, 2, 2, 2, 1, 1, 1];
        const pBreakpoints = [2, 2, 2, 2, 2, 1, 1, 1, 1, 1];
        const kBreakpoints = [2, 1, 1, 1, 2, 2, 2, 2, 2, 2]
        return new Array<Tile | undefined>(numTilesX * numTilesY)
            .fill(undefined)
            .map((_, index) => new Tile(index))
            .map((tile) => {
                const {x, y} = indexToMapCoordinates(tile.index, numTilesX);
                const distanceFromCentre = Phaser.Math.Distance.Between(centrePoint.x, centrePoint.y, x, y);
                
                const ratio = (distanceFromCentre / radius);

                tile.soil = {
                    nitrogenContent: nBreakpoints[Math.floor(ratio * nBreakpoints.length)],
                    phosphorousContent: pBreakpoints[Math.floor(ratio * pBreakpoints.length)],
                    potassiumContent: kBreakpoints[Math.floor(ratio * kBreakpoints.length)]
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
            .filter(() => this.rnd.integerInRange(1, 18) == 1)
            .reduce<River[]>((mirroredRivers, river) => { 
                // Mirror mountains to both sides for balance
                return [
                    ...mirroredRivers,
                    {x: river.x, y: river.y},
                    {x: numTilesX - river.x - 1, y: numTilesY - river.y - 1}
                ];
            }, []);
    }
    private generateMountains(numTilesX: number, numTilesY: number): Mountain[] {
        return new Array<River | undefined>(numTilesX * numTilesY)
            .fill(undefined)
            .map((_, index) => ({
                x: index % numTilesX,
                y: Math.floor(index / numTilesX)
            }))
            .filter(() => this.rnd.integerInRange(1, 17) == 1)
            .reduce<Mountain[]>((mirroredMountains, mountain) => { 
                // Mirror mountains to both sides for balance
                return [
                    ...mirroredMountains,
                    {x: mountain.x, y: mountain.y},
                    {x: numTilesX - mountain.x - 1, y: numTilesY - mountain.y - 1}
                ];
            }, []);
    }
}