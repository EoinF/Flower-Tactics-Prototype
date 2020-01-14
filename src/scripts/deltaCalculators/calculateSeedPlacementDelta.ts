import { GameState } from "../objects/GameState";
import { GameStateDelta } from "../objects/GameStateDelta";
import { PlacedSeedsMap, PlacedSeed } from "../controllers/GameActionController";
import { StringMap } from "../types";

export function calculateSeedPlacementDelta(state: GameState, delta: GameStateDelta, placedSeeds: PlacedSeedsMap) {
    placedSeeds.forEach((placedSeed) => {
        delta.addDelta(["seedStatus", placedSeed.type, "quantity"], - placedSeed.amount);
        delta.addIntermediateDelta<StringMap<PlacedSeed[]>>("placedSeeds", existingValue => {
            if (existingValue == null) {
                return {
                    [placedSeed.type]: [{
                        ...placedSeed,
                        amount: placedSeed.amount 
                    }]
                }
            } else {
                return {
                    ...existingValue,
                    [placedSeed.type]: [
                        ...existingValue[placedSeed.type],
                        {
                            ...placedSeed, 
                            amount: placedSeed.amount
                        }
                    ]
                }
            }
        });
    });
}
