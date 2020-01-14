import { GameState } from "../objects/GameState";
import { GameDeltaController } from "../controllers/GameDeltaController";
import { GameStateController } from "../controllers/GameStateController";
import { calculateRiverDelta } from "../deltaCalculators/calculateRiverDelta";
import { calculateFlowerDelta } from "../deltaCalculators/calculateFlowerDelta";
import { GameStateDelta } from "../objects/GameStateDelta";
import { GameActionController, PlacedSeedsMap } from "../controllers/GameActionController";
import { combineLatest } from "rxjs";
import { calculateBaseSoilDelta } from "../deltaCalculators/calculateBaseSoilDelta";
import { calculateSeedPlacementDelta } from "../deltaCalculators/calculateSeedPlacementDelta";
import { calculateCloudDelta } from "../deltaCalculators/calculateCloudDelta";
import { calculateAugmentationDelta } from "../deltaCalculators/calculateAugmentationDelta";

export function setupGameDeltaManager(
    gameStateController: GameStateController,
    gameDeltaController: GameDeltaController,
    gameActionController: GameActionController
) {
    combineLatest(gameStateController.gameStateObservable(), gameActionController.placedSeedsMapObservable(), gameActionController.placedCloudsObservable())
        .subscribe(([gameState, placedSeedsMap, placedCloudTileIndex]) => {
            gameDeltaController.setDelta(calculateDelta(gameState, placedSeedsMap, placedCloudTileIndex));
        });
}

function calculateDelta(state: GameState, placedSeeds: PlacedSeedsMap, placedCloudTileIndex: number | null) {
    const delta = new GameStateDelta();
    calculateBaseSoilDelta(state, delta);
    calculateRiverDelta(state, delta);
    calculateFlowerDelta(state, delta);
    calculateCloudDelta(state, delta, placedCloudTileIndex);
    calculateSeedPlacementDelta(state, delta, placedSeeds);
    calculateAugmentationDelta(state, delta);
    return delta;
}
