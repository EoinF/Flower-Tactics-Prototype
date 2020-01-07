import { withLatestFrom, map, filter, flatMap, first, tap } from 'rxjs/operators';
import { combineLatest, merge } from 'rxjs';
import { GuiController } from './controllers/GuiController';
import { GameStateManager } from './controllers/GameStateManager';
import { MapController } from './controllers/MapController';
import { FlowerSelectionController } from './controllers/FlowerSelectionController';
import { calculateSeedEvolve } from './deltaCalculators/calculateSeedEvolve';
import { SEED_INTERVALS } from './constants';
import { SelectedObjectController } from './controllers/SelectedObjectController';
import { EvolveSeedController } from './controllers/EvolveSeedController';
import { HeldObjectController } from './controllers/HeldObjectController';
import { indexToMapCoordinates } from './widgets/utils';

interface TileLocation {
    tileX: number,
    tileY: number
}

function guiPositionToTileLocation(camera: Phaser.Cameras.Scene2D.Camera, x: number, y: number): TileLocation {
    const {
        x: worldX,
        y: worldY
    } = camera.getWorldPoint(x, y);
    const tileX = Math.floor((worldX + 24) / 48);
    const tileY = Math.floor((worldY + 24) / 48);
    return { tileX, tileY };
}

export function setupConnectors(
    guiController: GuiController,
    gameStateManager: GameStateManager,
    mapController: MapController,
    flowerSelectionController: FlowerSelectionController,
    selectedObjectController: SelectedObjectController,
    evolveSeedController: EvolveSeedController,
    heldObjectController: HeldObjectController
) {
    const onClickInfoButton$ = guiController.onClickInfoButtonObservable();
    const onClickEvolveButton$ = guiController.onClickEvolveButtonObservable();
    const endTurn$ = guiController.endTurnObservable();
    const isMouseOverSeedContainer$ = guiController.mouseOverSeedContainerObservable();
    const isMouseOverFlowerSelection$ = guiController.mouseOverFlowerSelectionObservable();
    const isHoldingShiftKey$ = guiController.isHoldingShiftKeyObservable();

    const heldSeed$ = heldObjectController.heldSeedObservable();
    const heldClouds$ = heldObjectController.heldCloudObservable();

    const gameState$ = gameStateManager.nextStateObservable();
    const gameStateDelta$ = gameStateManager.nextDeltaObservable();
    const currentPlayer$ = gameStateManager.currentPlayerObservable();

    const mapCamera$ = mapController.cameraObservable();
    const clickTile$ = mapController.clickTileObservable();

    const selectedFlowerIndex$ = flowerSelectionController.selectedFlowerIndexObservable();
    const flowerSelection_selectedFlowerType$ = flowerSelectionController.selectedFlowerTypeObservable();

    const stagedSeeds$ = evolveSeedController.stagedSeedsObservable();
    const evolveSeed_selectedFlowerType$ = evolveSeedController.selectedFlowerTypeObservable();
    const flowerNames$ = evolveSeedController.flowerNamesObservable();

    const mousePosition$ = guiController.mousePositionObservable();

    const flowerTypeOnClickingInfoButton$ = onClickInfoButton$.pipe(
        flatMap(() => flowerSelection_selectedFlowerType$),
        filter(selectedFlowerType => selectedFlowerType != null)
    );

    merge(flowerTypeOnClickingInfoButton$, flowerSelection_selectedFlowerType$, evolveSeed_selectedFlowerType$).pipe(
        filter((flowerType) => flowerType != null)
    ).subscribe((flowerType) => {
        selectedObjectController.setSelectedFlowerType(flowerType);
    })

    const flowerTypesArray$ = combineLatest(gameState$, currentPlayer$).pipe(
        map(([state, currentPlayerId]) => state.players[currentPlayerId as string].seedsOwned)
    );
    
    combineLatest(selectedFlowerIndex$, flowerTypesArray$.pipe(first()), (selectedIndex) => selectedIndex)
        .pipe(withLatestFrom(flowerTypesArray$))
        .subscribe(([selectedIndex, flowerTypesArray]) => {
        if (selectedIndex < 0) {
            flowerSelectionController.selectFlowerByIndex(selectedIndex + flowerTypesArray.length);
        } else if (selectedIndex >= flowerTypesArray.length) {
            flowerSelectionController.selectFlowerByIndex(selectedIndex % flowerTypesArray.length);
        } else {
            flowerSelectionController.selectFlower(flowerTypesArray[selectedIndex]);
        }
    })

    endTurn$.subscribe(() => {
        gameStateManager.nextState();
    });

    clickTile$
        .pipe(
            withLatestFrom(
                isMouseOverSeedContainer$,
                isMouseOverFlowerSelection$,
                gameState$,
                gameStateDelta$,
                heldSeed$
            ),
            withLatestFrom(
                isHoldingShiftKey$
            )
        ).subscribe(([[clickedTile, isMouseOverSeedContainer, isMouseOverFlowerSelection, gameState, gameStateDelta, heldSeed], isHoldingShiftKey]) => {
            if (!isMouseOverSeedContainer && !isMouseOverFlowerSelection) {
                if (heldSeed != null) {
                    const isOtherSeedTypeBlockingTile = Object.keys(gameStateDelta.placedSeeds)
                        .filter(type => type != heldSeed.type)
                        .some(type => {
                            return gameStateDelta.placedSeeds[type].has(clickedTile)
                                && gameStateDelta.placedSeeds[type].get(clickedTile)! > 0;
                        });

                    const tile = gameState.tiles[clickedTile];
                    const location = indexToMapCoordinates(clickedTile, gameState.numTilesX);
                    const isFlowerBlockingTile = (gameState.getFlowerAtTile(tile) != null);
                    const isMountainBlockingTile = (gameState.getMountainAtTile(tile) != null);

                    const isFlowerAdjacent = gameState.getTilesAdjacent(location.x, location.y).some(
                        adjacentTile => {
                            return gameState.getFlowerAtTile(adjacentTile) != null
                        }
                    );

                    if (isOtherSeedTypeBlockingTile) {
                        guiController.createAlertMessage("Another type of seed is already placed on this tile.");
                    } else if (isFlowerBlockingTile) {
                        guiController.createAlertMessage("A flower is blocking seed placement.");
                    } else if (isMountainBlockingTile) {
                        guiController.createAlertMessage("A mountain is blocking seed placement.");
                    } else if (!isFlowerAdjacent) {
                        guiController.createAlertMessage("You can only place seeds near your existing flowers.");
                    }
                    else {
                        if (isHoldingShiftKey) {
                            gameStateManager.removeSeed(heldSeed.type, clickedTile);
                        } else {
                            gameStateManager.placeSeed(heldSeed.type, clickedTile);
                        }
                    }
                }
            }
        });

    clickTile$
        .pipe(
            withLatestFrom(heldClouds$)
        )
        .subscribe(([tileIndex, heldCloud]) => {
            if (heldCloud != null) {
                gameStateManager.placeClouds(tileIndex);
            }
        });

    combineLatest(mousePosition$, mapCamera$, isMouseOverSeedContainer$, isMouseOverFlowerSelection$)
        .pipe(
            withLatestFrom(gameState$),
        ).subscribe(([[mousePosition, camera, isMouseOverContainer, isMouseOverFlowerSelection], gameState]) => {
            if (mousePosition != null) {
                const tileXY = guiPositionToTileLocation(camera, mousePosition.x, mousePosition.y);
                const tile = gameState.getTileAt(tileXY.tileX, tileXY.tileY);

                if (!isMouseOverContainer && !isMouseOverFlowerSelection && tile != null) {
                    mapController.setMouseOverTile(tile);
                    return;
                }
            }
            mapController.setMouseOverTile(null);
        });

    onClickEvolveButton$.pipe(
        withLatestFrom(gameState$, flowerNames$),
        map(([_, gameState, flowerNames]) => {
            return flowerNames[gameState.getNextRandomNumber(0, flowerNames.length - 1)];
        }),
        withLatestFrom(gameState$, stagedSeeds$)
    ).subscribe(([newFlowerName, gameState, stagedSeed]) => {
        if (stagedSeed != null) {
            const result = calculateSeedEvolve(stagedSeed, gameState, newFlowerName);
            evolveSeedController.setEvolveStatus(result.outcomeType);

            const seedsToDelete = [{
                type: stagedSeed.type,
                amount: SEED_INTERVALS[stagedSeed.stagedAmount]
            }];

            if (result.outcomeType != 'FAILURE' && result.newFlower != null) {
                gameStateManager.applyEvolveResult(seedsToDelete, result.newFlower);
            } else {
                gameStateManager.deleteSeeds(seedsToDelete);
            }
        }
    })
}