import { Tile } from "./objects/Tile";
import { GameState } from "./GameState";

export interface MapGeneratorConfig {
    numTilesX: number;
    numTilesY: number;
}

export class MapGenerator {
    rnd: Phaser.Math.RandomDataGenerator
    constructor(seed: number) {
        this.rnd = new Phaser.Math.RandomDataGenerator(seed.toString());
    }

    public generateNewMap({
        numTilesX = 10,
        numTilesY = 10
    }: MapGeneratorConfig): GameState {
        return {
            numTilesX,
            numTilesY,
            tiles: this.generateTiles(numTilesX, numTilesY)
        }
    }
    
    private generateTiles(numTilesX: number, numTilesY: number): Tile[] {
        return new Array<Tile | undefined>(numTilesX * numTilesY)
            .fill(undefined)
            .map(() => new Tile())
            .map((tile, index) => {
                tile.soil = {
                    nitrogenContent: 0.3 + 0.2 * this.rnd.frac(),
                    potassiumContent: 0.25 + 0.05 * this.rnd.frac(),
                    phosphorousContent: 0.15 + 0.05 * this.rnd.frac()
                }
                return tile;
            });
    }
}