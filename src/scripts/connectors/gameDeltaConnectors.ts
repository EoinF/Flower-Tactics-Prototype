import { GameState } from "../objects/GameState";
import { GameDeltaController } from "../controllers/GameDeltaController";
import { GameStateController } from "../controllers/GameStateController";
import { calculateFlowerDelta } from "../deltaCalculators/calculateFlowerDelta";
import { GameStateDelta } from "../objects/GameStateDelta";
import { GameActionController, SeedTypeToPlacedSeedsMap } from "../controllers/GameActionController";
import { combineLatest, of, merge } from "rxjs";
import { calculateSeedPlacementDelta } from "../deltaCalculators/calculateSeedPlacementDelta";
import { calculateCloudDelta } from "../deltaCalculators/calculateCloudDelta";
import { calculateAugmentationDelta } from "../deltaCalculators/calculateAugmentationDelta";
import { StringMap } from "../types";
import { switchMap, filter, tap, withLatestFrom, map } from "rxjs/operators";

export function setupGameDeltaManager(
    gameStateController: GameStateController,
    gameDeltaController: GameDeltaController,
    gameActionController: GameActionController
) {
    const latestDeltaInputs$ = combineLatest(
        gameStateController.gameStateObservable(),
        gameActionController.placedSeedsMapObservable(),
        gameActionController.placedCloudsObservable()
    );

    gameStateController.gamePhaseObservable().pipe(
        switchMap(phase => {
            if (phase !== 'ACTION') {
                return of([]).pipe(filter(() => false)); // Don't emit outside of ACTION phase
            } else {
                return latestDeltaInputs$;
            }
        })
    ).subscribe(([gameState, placedSeedsMap, placedClouds]) => {
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
