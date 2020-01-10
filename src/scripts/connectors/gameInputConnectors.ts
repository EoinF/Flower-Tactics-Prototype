import { GameStateController } from "../controllers/GameStateController";
import { GameDeltaController } from "../controllers/GameDeltaController";
import { HeldObjectController } from "../controllers/HeldObjectController";
import { GuiController } from "../controllers/GuiController";
import { MapController } from "../controllers/MapController";
import { withLatestFrom } from "rxjs/operators";
import { indexToMapCoordinates } from "../widgets/utils";
import { GameActionController } from "../controllers/GameActionController";

export function setupGameInputConnectors(
    gameStateController: GameStateController, gameDeltaController: GameDeltaController,
    heldObjectController: HeldObjectController, guiController: GuiController, mapController: MapController,
    gameActionController: GameActionController
) {
    const gameState$ = gameStateController.gameStateObservable();
    const placedSeedsMap$ = gameActionController.placedSeedsMapObservable();
    const heldSeed$ = heldObjectController.heldSeedObservable();
    const heldClouds$ = heldObjectController.heldCloudObservable();
    const isHoldingShiftKey$ = guiController.isHoldingShiftKeyObservable();
    const endTurn$ = guiController.endTurnObservable();
    const clickTile$ = mapController.clickTileObservable();
    
    endTurn$.pipe(
        withLatestFrom(placedSeedsMap$)
    ).subscribe(([_, placedSeedsMap]) => {
        gameActionController.resetSeeds();
        gameActionController.resetClouds();
    })

    clickTile$
        .pipe(
            withLatestFrom(
                gameState$,
                placedSeedsMap$,
                heldSeed$,
                isHoldingShiftKey$
            )
        ).subscribe(([clickedTile, gameState, placedSeedsMap, heldSeed, isHoldingShiftKey]) => {
            if (heldSeed != null) {
                const existingSeed = placedSeedsMap.get(clickedTile) || {type: null, amount: 0};
                const isOtherSeedTypeBlockingTile = existingSeed.amount > 0 && existingSeed.type != heldSeed.type;

                const tile = gameState.tiles[clickedTile];
                const location = indexToMapCoordinates(clickedTile, gameState.numTilesX);
                const isFlowerBlockingTile = (gameState.getFlowerAtTile(tile) != null);
                const isMountainBlockingTile = (gameState.getMountainAtTile(tile) != null);

                const isFlowerAdjacent = gameState.getTilesAdjacent(location.x, location.y).some(
                    adjacentTile => {
                        return gameState.getFlowerAtTile(adjacentTile) != null
                    }
                );

                const hasSufficientSeeds = (gameState.seedStatus[heldSeed.type].quantity - existingSeed.amount) > 0;

                if (isOtherSeedTypeBlockingTile) {
                    guiController.createAlertMessage("Another type of seed is already placed on this tile.");
                } else if (isFlowerBlockingTile) {
                    guiController.createAlertMessage("A flower is blocking seed placement.");
                } else if (isMountainBlockingTile) {
                    guiController.createAlertMessage("A mountain is blocking seed placement.");
                } else if (!isFlowerAdjacent) {
                    guiController.createAlertMessage("You can only place seeds near your existing flowers.");
                } else if (!hasSufficientSeeds) {
                    guiController.createAlertMessage("You don't have any seeds remaining.");
                } else {
                    if (isHoldingShiftKey) {
                        gameActionController.removeSeed(heldSeed.type, clickedTile);
                    } else {
                        gameActionController.placeSeed(heldSeed.type, clickedTile);
                    }
                }
            }
        });

    clickTile$
        .pipe(
            withLatestFrom(heldClouds$)
        )
        .subscribe(([tileIndex, heldClouds]) => {
            if (heldClouds != null) {
                gameActionController.placeClouds(tileIndex);
            }
        });
}
