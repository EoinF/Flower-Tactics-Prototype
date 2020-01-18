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
    const currentPlayerId$ = gameStateController.currentPlayerObservable();

    const placedSeedsMap$ = gameActionController.placedSeedsMapObservable();
    const heldSeed$ = heldObjectController.heldSeedObservable();
    const isHoldingCloud$ = heldObjectController.isHoldingCloudObservable();
    const endTurn$ = guiController.endTurnObservable();
    const clickTile$ = mapController.clickTileObservable();

    const inputManager$ = guiController.inputManagerObservable();
    
    endTurn$.subscribe(() => {
        gameActionController.resetSeeds();
        gameActionController.resetClouds();
    })

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
                const existingSeed = placedSeedsMap.get(clickedTile) || {type: null, amount: 0};
                const isOtherSeedTypeBlockingTile = existingSeed.amount > 0 && existingSeed.type != heldSeed.type;

                const tile = gameState.tiles[clickedTile];
                const playerFlowers = gameState.players[currentPlayerId].flowers;
                const { x, y } = indexToMapCoordinates(clickedTile, gameState.numTilesX);
                const isFlowerBlockingTile = (gameState.getFlowerIndexAtTile(tile) != null);
                const isMountainBlockingTile = (gameState.getMountainAtTile(tile) != null);
                const isFlowerAdjacent = gameState.getTilesAdjacent(x, y).some(adjacentTile => {
                    const flowerAtTile = gameState.getFlowerIndexAtTile(adjacentTile);
                    return flowerAtTile != null && playerFlowers.indexOf(flowerAtTile) !== -1
                });

                let placedSeedsAmount = 0;
                placedSeedsMap.forEach(placedSeed => {
                    if (placedSeed.type === heldSeed.type) {
                        placedSeedsAmount += placedSeed.amount;
                    } 
                })
                const hasSufficientSeeds = (gameState.seedStatus[heldSeed.type].quantity - placedSeedsAmount) > 0;
                const tileHasSeeds = existingSeed.amount > 0;

                if (isOtherSeedTypeBlockingTile) {
                    guiController.createAlertMessage("Another type of seed is already placed on this tile.");
                } else if (isFlowerBlockingTile) {
                    guiController.createAlertMessage("A flower is blocking seed placement.");
                } else if (isMountainBlockingTile) {
                    guiController.createAlertMessage("A mountain is blocking seed placement.");
                } else if (!isFlowerAdjacent) {
                    guiController.createAlertMessage("You can only place seeds near your existing flowers.");
                } else {
                    if (inputManager.shift!.isDown) {
                        if (tileHasSeeds) {
                            gameActionController.removeSeed(heldSeed.type, clickedTile, currentPlayerId);
                        }
                    } else {
                        if (!hasSufficientSeeds) {
                            guiController.createAlertMessage("You don't have any seeds remaining.");
                        } else {
                            gameActionController.placeSeed(heldSeed.type, clickedTile, currentPlayerId);
                        }
                    }
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
}
