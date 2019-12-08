import { Tile } from "./Tile";
import { Flower } from "./Flower";
import { Mountain } from "./Mountain";
import { River } from "./River";
import { FlowerType } from "./FlowerType";
import { StringMap } from "../types";
import { SeedStatusDelta } from "../controllers/GameStateManager";

export interface GameStateData {
    numTilesX: number;
    numTilesY: number;
    tiles: Tile[];
    flowers: Flower[];
    mountains: Mountain[];
    rivers: River[];
    flowerTypes: StringMap<FlowerType>;
    seedStatus: StringMap<SeedStatusDelta>;
}

export class GameState implements GameStateData {
    numTilesX: number;
    numTilesY: number;
    tiles: Tile[];
    flowers: Flower[];
    mountains: Mountain[];
    rivers: River[];
    flowerTypes: StringMap<FlowerType>;

    tileToFlowerMap: Map<Tile, Flower>;
    tileToRiverMap: Map<Tile, River>;
    tileToMountainMap: Map<Tile, Mountain>;
    seedStatus: StringMap<SeedStatusDelta>;

    constructor(data: GameStateData) {
        Object.keys(data).forEach(key => {
            this[key] = data[key];
        });
        this.tileToFlowerMap = new Map<Tile, Flower>();
        this.tileToRiverMap = new Map<Tile, River>();
        this.tileToMountainMap = new Map<Tile, Mountain>();

        this.mapTilesToFlowers(data.flowers, this.tileToFlowerMap);
        this.mapTilesToRivers(data.rivers, this.tileToRiverMap);
        this.mapTilesToMountains(data.mountains, this.tileToMountainMap);
    }

    private mapTilesToFlowers(flowers: Flower[], map: Map<Tile, Flower>) {
        flowers.forEach(flower => {
            const tile = this.getTileAt(flower.x, flower.y)!;
            const existingFlower = map.get(tile);
            if (existingFlower != null) {
                throw new Error("Two flowers cannot exist on the same tile! " 
                    + JSON.stringify(existingFlower)
                    + JSON.stringify(flower));
            } else {
                map.set(tile, flower);
            }
        });
    }

    private mapTilesToRivers(rivers: River[], map: Map<Tile, River>) {
        rivers.forEach(river => {
            const tile = this.getTileAt(river.x, river.y)!;
            map.set(tile, river);
        });
    }
    private mapTilesToMountains(mountains: Mountain[], map: Map<Tile, Mountain>) {
        mountains.forEach(mountain => {
            const tile = this.getTileAt(mountain.x, mountain.y)!;
            map.set(tile, mountain);
        });
    }

    getRiverAtTile(tile: Tile): River | undefined {
        return this.tileToRiverMap.get(tile);
    }
    
    getMountainAtTile(tile: Tile): Mountain | undefined {
        return this.tileToMountainMap.get(tile);
    }
    
    getFlowerAtTile(tile: Tile): Flower | null {
        return this.tileToFlowerMap.get(tile) || null;
    }

    getFlowerAt(x: number, y: number) {
        const tile = this.getTileAt(x, y);
        if (tile != null) {
            return this.getFlowerAtTile(tile);
        } else {
            throw Error(`No tile exists at [${x},${y}] - getFlowerAt`)
        }
    }

    getTileAt(x: number, y: number): Tile | null {
        if (x >= 0 && x < this.numTilesX && y >= 0 && y < this.numTilesY) {
            const tileIndex = x + y * this.numTilesX;
            return this.tiles[tileIndex];
        } else {
            return null;
        }
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
                    const tile = this.getTileAt(i, j);
                    if (tile != null) {
                        adjacentTiles.push(tile);
                    }
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