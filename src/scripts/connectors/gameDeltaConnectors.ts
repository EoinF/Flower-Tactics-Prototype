import { GameState } from "../objects/GameState";
import { GameDeltaController } from "../controllers/GameDeltaController";
import { GameStateController } from "../controllers/GameStateController";
import { calculateFlowerDelta } from "../deltaCalculators/calculateFlowerDelta";
import { GameStateDelta } from "../objects/GameStateDelta";
import { GameActionController, SeedTypeToPlacedSeedsMap } from "../controllers/GameActionController";
import { combineLatest } from "rxjs";
import { calculateSeedPlacementDelta } from "../deltaCalculators/calculateSeedPlacementDelta";
import { calculateCloudDelta } from "../deltaCalculators/calculateCloudDelta";
import { calculateAugmentationDelta } from "../deltaCalculators/calculateAugmentationDelta";
import { StringMap } from "../types";

export function setupGameDeltaManager(
    gameStateController: GameStateController,
    gameDeltaController: GameDeltaController,
    gameActionController: GameActionController
) {
    combineLatest(gameStateController.gameStateObservable(), gameActionController.placedSeedsMapObservable(), gameActionController.placedCloudsObservable())
        .subscribe(([gameState, placedSeedsMap, placedClouds]) => {
            gameDeltaController.setDelta(calculateDelta(gameState, placedSeedsMap, placedClouds));
        });
}

function calculateDelta(state: GameState, placedSeeds: SeedTypeToPlacedSeedsMap, placedClouds: StringMap<number>) {
    const delta = new GameStateDelta();
    calculateFlowerDelta(state, delta);
    calculateCloudDelta(state, delta, placedClouds);
    calculateSeedPlacementDelta(state, delta, placedSeeds);
    calculateAugmentationDelta(state, delta);
    return delta;
}
