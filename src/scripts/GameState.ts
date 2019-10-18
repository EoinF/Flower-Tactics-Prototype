import { Tile } from "./objects/Tile";
import { Flower } from "./objects/Flower";
import { Mountain } from "./objects/Mountain";
import { River } from "./objects/River";

export interface GameState {
    numTilesX: number;
    numTilesY: number;
    tiles: Tile[];
    flowers: Flower[];
    mountains: Mountain[];
    rivers: River[];
}