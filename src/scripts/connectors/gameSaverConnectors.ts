import { GameStateController } from '../controllers/GameStateController';
import { filter, withLatestFrom } from 'rxjs/operators';
import { SavedGameController } from '../controllers/SavedGameController';

export function setupGameSaverConnectors(gameStateController: GameStateController, savedGameController: SavedGameController) {
    const gamePhase$ = gameStateController.gamePhaseObservable();
    const gameState$ = gameStateController.gameStateObservable();

    gamePhase$.pipe(
        filter(gamePhase => gamePhase === "RESETTING_ACTIONS"),
        withLatestFrom(gameState$)
    ).subscribe(([_, gameState]) => {
        savedGameController.saveGame(gameState);
    });
}

