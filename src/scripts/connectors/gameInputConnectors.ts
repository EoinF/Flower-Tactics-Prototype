import { GameStateController } from "../controllers/GameStateController";
import { GameDeltaController } from "../controllers/GameDeltaController";
import { HeldObjectController } from "../controllers/HeldObjectController";
import { GuiController } from "../controllers/GuiController";
import { MapController } from "../controllers/MapController";
import { withLatestFrom } from "rxjs/operators";
import { indexToMapCoordinates } from "../widgets/utils";
import { GameActionController, PlacedSeed } from "../controllers/GameActionController";

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
                let playerOwnedSeedAmountOnTile = 0;
                let playerOwnedTypeOnTile: string | null = null;
                const enemySeedsOnTile: PlacedSeed[] = [];
                
                placedSeedsMap.getSeedsAtTile(clickedTile).forEach(placedSeed => {
                    if (gameState.players[currentPlayerId].seedsOwned.indexOf(placedSeed.type) !== -1) {
                        playerOwnedSeedAmountOnTile = placedSeed.amount;
                        playerOwnedTypeOnTile = placedSeed.type;
                    } else {
                        enemySeedsOnTile.push(placedSeed);
                    }
                });

                const isOtherOwnedSeedTypeBlockingTile = playerOwnedTypeOnTile != null && playerOwnedTypeOnTile !== heldSeed.type;

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
                placedSeedsMap.getAllSeeds().forEach(placedSeed => {
                    if (placedSeed.type === heldSeed.type) {
                        placedSeedsAmount += placedSeed.amount;
                    }
                });
                const hasSufficientSeeds = (gameState.seedStatus[heldSeed.type].quantity - placedSeedsAmount) > 0;
                const tileHasSeeds = playerOwnedSeedAmountOnTile > 0;

                if (isFlowerBlockingTile) {
                    guiController.createAlertMessage("A flower is blocking seed placement.");
                } else if (isMountainBlockingTile) {
                    guiController.createAlertMessage("A mountain is blocking seed placement.");
                } else if (!isFlowerAdjacent) {
                    guiController.createAlertMessage("You can only place seeds near your existing flowers.");
                } else {
                    if (inputManager.shift!.isDown) {
                        if (tileHasSeeds) {
                            gameActionController.removeSeed(playerOwnedTypeOnTile!, clickedTile, currentPlayerId);
                        }
                    } else {
                        if (isOtherOwnedSeedTypeBlockingTile) {
                        guiController.createAlertMessage("Another type of seed is already placed on this tile.");
                        } else if (!hasSufficientSeeds) {
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
