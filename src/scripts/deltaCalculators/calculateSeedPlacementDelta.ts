import { GameState } from "../objects/GameState";
import { GameStateDelta } from "../objects/GameStateDelta";
import { PlacedSeed, SeedTypeToPlacedSeedsMap } from "../controllers/GameActionController";
import { StringMap } from "../types";

export function calculateSeedPlacementDelta(state: GameState, delta: GameStateDelta, placedSeeds: SeedTypeToPlacedSeedsMap) {
    placedSeeds.getAllSeeds().forEach(placedSeed => {
        delta.addDelta(["seedStatus", placedSeed.type, "quantity"], - placedSeed.amount);
    });
}
