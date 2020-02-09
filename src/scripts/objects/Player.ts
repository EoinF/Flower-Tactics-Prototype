import { StringMap } from "../types";

export type PlayerType = 'Human' | 'AI_1' | 'AI_2' | 'None';

export interface Player {
    controlledBy: PlayerType;
    flowers: string[];
    seedsOwned: string[];
    cloudOwned: string | null;
    autoReplantTileMap: StringMap<string>;
}