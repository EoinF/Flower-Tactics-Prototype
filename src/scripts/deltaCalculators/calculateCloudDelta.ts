import { GameState } from "../objects/GameState";
import { GameStateDelta } from "../objects/GameStateDelta";
import { StringMap } from "../types";

export function calculateCloudDelta(gameState: GameState, gameDelta: GameStateDelta, placedClouds: StringMap<number>) {
    Object.keys(placedClouds)
        .forEach(key => {
            gameDelta.addDelta(["clouds", key, 'tileIndex'], placedClouds[key], "DELTA_REPLACE");
        });
}