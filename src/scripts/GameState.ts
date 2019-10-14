import { Tile } from "./objects/Tile";

export interface GameState {
    numTilesX: number;
    numTilesY: number;
    tiles: Tile[]
}