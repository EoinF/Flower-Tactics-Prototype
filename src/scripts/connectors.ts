import { withLatestFrom, map, filter, flatMap } from 'rxjs/operators';
import { combineLatest, merge } from 'rxjs';
import { GuiController } from './controllers/GuiController';
import { GameStateManager } from './controllers/GameStateManager';
import { SeedController } from './controllers/SeedController';
import { MapController } from './controllers/MapController';
import { FlowerSelectionController } from './controllers/FlowerSelectionController';
import { selectedObjectController } from './game';

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
    seedController: SeedController, 
    mapController: MapController,
    flowerSelectionController: FlowerSelectionController
) {
    const endTurn$ = guiController.endTurnObservable();
    const dragSeed$ = seedController.dragSeedObservable();
    const dropSeed$ = seedController.dropSeedObservable();
    const gameState$ = gameStateManager.nextStateObservable();
    const gameStateDelta$ = gameStateManager.nextDeltaObservable();
    const mapCamera$ = mapController.cameraObservable();
    const isMouseOverSeedContainer$ = seedController.mouseOverSeedContainerObservable();
    const pickedUpSeed$ = seedController.pickUpSeedObservable();
    const selectedFlowerIndex$ = flowerSelectionController.selectedFlowerIndexObservable();
    const selectedFlowerType$ = flowerSelectionController.selectedFlowerTypeObservable();
    const isMouseOverFlowerSelection$ = seedController.mouseOverFlowerSelectionObservable();
    const onClickInfoButton$ = guiController.onClickInfoButtonObservable();

    const flowerTypeOnClickingInfoButton$ = onClickInfoButton$.pipe(
        flatMap(() => selectedFlowerType$),
        filter(selectedFlowerType => selectedFlowerType != null)
    );

    merge(flowerTypeOnClickingInfoButton$, selectedFlowerType$).pipe(
        filter((flowerType) => flowerType != null)
    ).subscribe((flowerType) => {
        selectedObjectController.setSelectedFlowerType(flowerType.type);
    })

    const flowerTypesArray$ = gameState$.pipe(
        map(
            state => Object.keys(state.flowerTypes)
                .map(key => state.flowerTypes[key])
        )
    );

    combineLatest(selectedFlowerIndex$, flowerTypesArray$)
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

    dropSeed$
        .pipe(
            withLatestFrom(combineLatest([isMouseOverSeedContainer$, isMouseOverFlowerSelection$, gameState$, gameStateDelta$, mapCamera$, pickedUpSeed$]))
        ).subscribe(([droppedSeed, [isMouseOverSeedContainer, isMouseOverFlowerSelection, gameState, gameStateDelta, camera, pickedUpSeed]]) => {
            if (!isMouseOverSeedContainer && !isMouseOverFlowerSelection) {
                const tileXY = guiPositionToTileLocation(camera, droppedSeed.x, droppedSeed.y);
                const tile = gameState.getTileAt(tileXY.tileX, tileXY.tileY);
                if (tile != null) {
                    const isOtherSeedTypeBlockingTile = Object.keys(gameStateDelta.placedSeeds)
                        .filter(type => type != droppedSeed.type)
                        .some(type => {
                            return gameStateDelta.placedSeeds[type].has(tile.index)
                                && gameStateDelta.placedSeeds[type].get(tile.index)! > 0;
                        });

                    const isFlowerBlockingTile = (gameState.getFlowerAtTile(tile) != null);
                    const isMountainBlockingTile = (gameState.getMountainAtTile(tile) != null);

                    if (isOtherSeedTypeBlockingTile) {
                        guiController.createAlertMessage("Another type of seed is already placed on this tile.");
                    } else if (isFlowerBlockingTile) {
                        guiController.createAlertMessage("A flower is blocking seed placement.");
                    } else if (isMountainBlockingTile) {
                        guiController.createAlertMessage("A mountain is blocking seed placement.");
                    } else {
                        const isFlowerAdjacent = gameState.getTilesAdjacent(tileXY.tileX, tileXY.tileY).some(
                            adjacentTile => gameState.getFlowerAtTile(adjacentTile) != null
                        );
                        if (!isFlowerAdjacent) {
                            guiController.createAlertMessage("You can only place seeds near your existing flowers.");
                        }
                        else {
                            if (pickedUpSeed.origin == 'SEED_ORIGIN_INVENTORY') {
                                gameStateManager.placeSeed(droppedSeed.type, tile.index);
                            } else { // SEED_ORIGIN_MAP
                                gameStateManager.moveSeed(droppedSeed.type, pickedUpSeed.tileIndex!, tile.index);
                            }
                            return;
                        }
                    }
                }
            } else if (pickedUpSeed.origin == 'SEED_ORIGIN_MAP') {
                if (pickedUpSeed.tileIndex != null) {
                    gameStateManager.removeSeed(pickedUpSeed.type, pickedUpSeed.tileIndex);
                    return;
                }
            }
            seedController.resetPickedUpSeed();
        });

    combineLatest(dragSeed$, mapCamera$, isMouseOverSeedContainer$, isMouseOverFlowerSelection$)
        .pipe(
            withLatestFrom(gameState$),
        ).subscribe(([[draggedSeed, camera, isMouseOverContainer, isMouseOverFlowerSelection], gameState]) => {
            if (draggedSeed != null) {
                const tileXY = guiPositionToTileLocation(camera, draggedSeed.x, draggedSeed.y);
                const tile = gameState.getTileAt(tileXY.tileX, tileXY.tileY);

                if (!isMouseOverContainer  && !isMouseOverFlowerSelection && tile != null) {
                    mapController.dragSeedOverTile(tile);
                    return;
                }
            }
            mapController.dragSeedOverTile(null);
        });
}