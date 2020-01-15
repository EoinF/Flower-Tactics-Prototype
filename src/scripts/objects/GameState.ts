import { Tile } from "./Tile";
import { Flower } from "./Flower";
import { Mountain } from "./Mountain";
import { River } from "./River";
import { FlowerType } from "./FlowerType";
import { StringMap } from "../types";
import { CLOUD_LAYOUT_SEED_MAX, CLOUD_GRID_WIDTH, CLOUD_GRID_HEIGHT } from "../constants";
import { CloudLayout } from "../controllers/HeldObjectController";
import { SeedStatus } from "./SeedStatus";
import { Player } from "./Player";
import { FlowerAugmentation } from "./FlowerAugmentation";

export interface GameStateData {
    cloudLayoutSeed: number | null;
    randomNumberGeneratorSeed: string;
    numTilesX: number;
    numTilesY: number;
    tiles: Tile[];
    flowersMap: StringMap<Flower>;
    mountains: Mountain[];
    rivers: River[];
    flowerTypes: StringMap<FlowerType>;
    players: StringMap<Player>;
    seedStatus: StringMap<SeedStatus>;
    flowerAugmentations: StringMap<FlowerAugmentation[]>;
    rainfallTiles: number[];
}

export class GameState implements GameStateData {
    cloudLayoutSeed: number;
    randomNumberGeneratorSeed: string;
    private randomNumberGenerator: Phaser.Math.RandomDataGenerator;
    private cloudLayout: CloudLayout;
    numTilesX: number;
    numTilesY: number;
    tiles: Tile[];
    flowersMap: StringMap<Flower>;
    mountains: Mountain[];
    rivers: River[];
    players: StringMap<Player>;
    flowerTypes: StringMap<FlowerType>;
    seedStatus: StringMap<SeedStatus>;
    flowerAugmentations: StringMap<FlowerAugmentation[]>;
    rainfallTiles: number[];

    tileToFlowerMap: Map<Tile, Flower>;
    tileToRiverMap: Map<Tile, River>;
    tileToMountainMap: Map<Tile, Mountain>;
    flowers: Flower[];

    constructor(data: GameStateData) {
        const {
            cloudLayoutSeed,
            ...otherData
        } = data;
        Object.keys(otherData).forEach(key => {
            this[key] = otherData[key];
        });
        this.tileToFlowerMap = new Map<Tile, Flower>();
        this.tileToRiverMap = new Map<Tile, River>();
        this.tileToMountainMap = new Map<Tile, Mountain>();
        this.randomNumberGenerator = new Phaser.Math.RandomDataGenerator(data.randomNumberGeneratorSeed);
        
        this.flowers = Object.keys(data.flowersMap).map(key => data.flowersMap[key]);

        this.mapTilesToFlowers(data.flowersMap, this.tileToFlowerMap);
        this.mapTilesToRivers(data.rivers, this.tileToRiverMap);
        this.mapTilesToMountains(data.mountains, this.tileToMountainMap);
    }

    private mapTilesToFlowers(flowers: StringMap<Flower>, map: Map<Tile, Flower>) {
        Object.keys(flowers).forEach(type => {
            const flower = flowers[type];
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

    getNextRandomNumber(min: number, max: number) {
        return this.randomNumberGenerator.integerInRange(min, max);
    }

    getRandomNumberSeed() {
        return this.randomNumberGenerator.state();
    }

    generateNextCloudLayout() {
        this.cloudLayoutSeed = 1;
        this.cloudLayout = [];

        let current = this.cloudLayoutSeed;
        for (let i = 0; i < CLOUD_GRID_WIDTH * CLOUD_GRID_HEIGHT; i++) {
            this.cloudLayout.push(current % 2 == 1);
            current = Math.floor(current / 2);
        }
    }
    
    getCloudLayout() {
        return this.cloudLayout;
    }

    getTileWaterContent(tile: Tile) {
        return (this.getRiverAtTile(tile) != null || this.rainfallTiles.indexOf(tile.index) !== -1) ? 1 : 0;
    }
}