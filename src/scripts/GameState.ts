import { Tile } from "./objects/Tile";
import { Flower } from "./objects/Flower";

export interface GameState {
    numTilesX: number;
    numTilesY: number;
    tiles: Tile[],
    flowers: Flower[]
}