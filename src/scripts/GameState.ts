import { Tile } from "./objects/Tile";
import { Flower } from "./objects/Flower";
import { Mountain } from "./objects/Mountain";
import { River } from "./objects/River";
import { FlowerType } from "./objects/FlowerType";
import { StringMap } from "./types";

export interface GameStateData {
    numTilesX: number;
    numTilesY: number;
    tiles: Tile[];
    flowers: Flower[];
    mountains: Mountain[];
    rivers: River[];
    flowerTypes: StringMap<FlowerType>;
    seedsOwned: StringMap<number>;
}

export class GameState implements GameStateData {
    numTilesX: number;
    numTilesY: number;
    tiles: Tile[];
    flowers: Flower[];
    mountains: Mountain[];
    rivers: River[];
    flowerTypes: StringMap<FlowerType>;

    tileToFlowerMap: Map<Tile, Flower[]>;
    seedsOwned: StringMap<number>;

    constructor(data: GameStateData) {
        Object.keys(data).forEach(key => {
            this[key] = data[key];
        });
        this.tileToFlowerMap = new Map<Tile, Flower[]>();

        this.mapTilesToFlowersArray(data.flowers, this.tileToFlowerMap);
    }

    private mapTilesToFlowersArray(flowers: Flower[], map: Map<Tile, Flower[]>) {
        flowers.forEach(flower => {
            const tile = this.getTileAt(flower.x, flower.y);
            const flowerArray = map.get(tile);
            if (flowerArray != null) {
                map.set(tile, [flower, ...flowerArray]);
            } else {
                map.set(tile, [flower]);
            }
        });
    }
    
    getFlowersAtTile(tile: Tile): Array<Flower> {
        return this.tileToFlowerMap.get(tile) || [];
    }

    getFlowerByTypeAt(type: string, x: number, y: number) {
        const flowers = this.tileToFlowerMap.get(this.getTileAt(x, y));
        if (flowers != null) {
            const flower = flowers.find(f => f.type === type);
            if (flower != null) {
                return flower;
            }
        } 
        throw Error(`No flower of type ${type} found at (${x},${y})`);    
    }

    getTileAt(x: number, y: number): Tile {
        const tileIndex = x + y * this.numTilesX;
        return this.tiles[tileIndex];
    }
    
    getTilesAdjacent(x: number, y: number): Tile[] {
        const minX = Math.max(0, x - 1);
        const minY = Math.max(0, y - 1);
        const maxX = Math.min(this.numTilesX - 1, x + 1);
        const maxY = Math.min(this.numTilesY - 1, y + 1);

        let adjacentTiles: Tile[] = [];
        for (let i = minX; i <= maxX; i++) {
            for (let j = minY; j <= maxY; j++) {
                if (!(i === x && j === y)) {
                    adjacentTiles.push(this.getTileAt(i, j));
                }
            }
        }
        return adjacentTiles;
    }

    updateTile(tile: Tile) {
        this.tiles[tile.index] = tile;
    }

    getFlowerType(flower: Flower) {
        return this.flowerTypes[flower.type];
    }
}