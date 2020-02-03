import { GameStateController } from "../controllers/GameStateController";
import { GameActionController, PlacedSeed } from "../controllers/GameActionController";
import { merge } from "rxjs";
import { withLatestFrom, filter, mergeMap, tap, skip } from "rxjs/operators";
import { GameState } from "../objects/GameState";

interface PlacedCloud {
    id: string;
    tileIndex: number;
}

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
                const ownPlacedSeeds = placedSeeds.getAllSeeds().filter(
                    placedSeed => placedSeed.ownerId === playerId
                );
                const ownedCloudID = gameState.players[playerId].cloudOwned;
                const ownedCloud = { id: ownedCloudID, tileIndex: placedCloud[ownedCloudID] };
                act(playerId, gameState, ownPlacedSeeds, ownedCloud, gameActionController)
            })
    })
}

function act(playerId: string, gameState: GameState, ownPlacedSeeds: PlacedSeed[], ownedCloud: PlacedCloud, 
    gameActionController: GameActionController
) {
    gameActionController.endTurn(playerId);
}