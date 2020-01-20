import { StringMap } from "../types";

export interface Player {
    flowers: string[];
    seedsOwned: string[];
    cloudOwned: string;
    autoReplantTileMap: StringMap<string>;
}