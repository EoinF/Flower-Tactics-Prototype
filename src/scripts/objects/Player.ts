import { StringMap } from "../types";

type PlayerType = 'Human' | 'AI' | 'None';

export interface Player {
    controlledBy: PlayerType;
    flowers: string[];
    seedsOwned: string[];
    cloudOwned: string | null;
    autoReplantTileMap: StringMap<string>;
}