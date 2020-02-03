import { GameStateController } from "../controllers/GameStateController";
import { GameActionController } from "../controllers/GameActionController";
import { merge } from "rxjs";
import { withLatestFrom, filter, mergeMap, tap, skip } from "rxjs/operators";

export function setupAIConnectors(gameStateController: GameStateController, gameActionController: GameActionController) {
    gameStateController.gamePhaseObservable().subscribe(() => {

    });
    gameStateController.gamePhaseObservable().pipe(
        withLatestFrom(gameStateController.gamePhaseObservable().pipe(skip(1))),
        filter(([_, phase]) => phase === 'ACTION'),
        mergeMap(() => gameStateController.gamePhaseObservable())
    ).pipe(
        filter(phase => phase === 'ACTION'),
        withLatestFrom(
            gameStateController.gameStateObservable(),
            gameActionController.placedSeedsMapObservable(),
            gameActionController.placedCloudsObservable()
        )
    ).subscribe(([_, gameState, placedSeeds, placedCloud]) => {
        Object.keys(gameState.players)
            .filter(playerId => gameState.players[playerId].controlledBy === 'AI')
            .forEach(playerId => {
                gameActionController.endTurn(playerId);
            })
    })
}