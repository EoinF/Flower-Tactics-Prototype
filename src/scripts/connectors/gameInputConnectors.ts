import { GameStateController } from "../controllers/GameStateController";
import { GameDeltaController } from "../controllers/GameDeltaController";
import { HeldObjectController } from "../controllers/HeldObjectController";
import { GuiController } from "../controllers/GuiController";
import { MapController } from "../controllers/MapController";
import { withLatestFrom } from "rxjs/operators";
import { indexToMapCoordinates } from "../widgets/utils";
import { GameActionController, PlacedSeed } from "../controllers/GameActionController";
import { getPlacementStatus } from "./utils";
import { SEED_PLACEMENT_MESSAGE_MAP } from "../constants";

export function setupGameInputConnectors(
    gameStateController: GameStateController, gameDeltaController: GameDeltaController,
    heldObjectController: HeldObjectController, guiController: GuiController, mapController: MapController,
    gameActionController: GameActionController
) {
    const gameState$ = gameStateController.gameStateObservable();
    const currentPlayerId$ = gameStateController.currentPlayerObservable();

    const placedSeedsMap$ = gameActionController.placedSeedsMapObservable();
    const heldSeed$ = heldObjectController.heldSeedObservable();
    const isHoldingCloud$ = heldObjectController.isHoldingCloudObservable();
    const clickTile$ = mapController.clickTileObservable();

    const inputManager$ = guiController.inputManagerObservable();

    clickTile$
        .pipe(
            withLatestFrom(
                gameState$,
                placedSeedsMap$,
                heldSeed$,
                inputManager$,
                currentPlayerId$
            )
        ).subscribe(([clickedTile, gameState, placedSeedsMap, heldSeed, inputManager, currentPlayerId]) => {
            if (heldSeed != null) {
                const result = getPlacementStatus(gameState.tiles[clickedTile], gameState, currentPlayerId, placedSeedsMap, heldSeed.type);

                if (inputManager.shift!.isDown
                    && (result === 'INSUFFICIENT_SEEDS_REMAINING' || result === 'OTHER_SEED_TYPE_BLOCKING' || result === 'PLACEMENT_ALLOWED')
                ) {
                    const playerOwnedTypeOnTile = placedSeedsMap.getSeedsAtTile(clickedTile).find(seed => seed.ownerId === currentPlayerId)!.type;
                    gameActionController.removeSeed(playerOwnedTypeOnTile!, clickedTile, currentPlayerId);
                } else if (result === "PLACEMENT_ALLOWED") {
                    gameActionController.placeSeed(heldSeed.type, clickedTile, currentPlayerId);
                } else {
                    guiController.createAlertMessage(SEED_PLACEMENT_MESSAGE_MAP[result]);
                }
            }
        });

    clickTile$
        .pipe(
            withLatestFrom(isHoldingCloud$, gameState$, currentPlayerId$)
        )
        .subscribe(([tileIndex, isHoldingCloud, gameState, currentPlayerId]) => {
            if (isHoldingCloud) {
                gameActionController.placeCloud(gameState.players[currentPlayerId].cloudOwned, tileIndex);
            }
        });

    guiController.endTurnObservable().pipe(
        withLatestFrom(gameStateController.currentPlayerObservable())
    ).subscribe(([_, playerId]) => {
        gameActionController.endTurn(playerId);
    })
}
