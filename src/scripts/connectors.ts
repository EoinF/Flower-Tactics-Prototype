import { withLatestFrom, map, filter, flatMap, first, mergeMapTo, takeWhile, take, repeatWhen, repeat, tap, mergeMap, switchMapTo, publish, share } from 'rxjs/operators';
import { combineLatest, merge, Observable, zip, of } from 'rxjs';
import { GuiController } from './controllers/GuiController';
import { GameStateManager } from './controllers/GameStateManager';
import { SeedController } from './controllers/SeedController';
import { MapController } from './controllers/MapController';
import { FlowerSelectionController } from './controllers/FlowerSelectionController';
import { calculateSeedEvolve } from './deltaCalculators/calculateSeedEvolve';
import { SEED_INTERVALS } from './constants';
import { SelectedObjectController } from './controllers/SelectedObjectController';
import { EvolveSeedController } from './controllers/EvolveSeedController';

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
    flowerSelectionController: FlowerSelectionController,
    selectedObjectController: SelectedObjectController, 
    evolveSeedController: EvolveSeedController
) {
    const onClickInfoButton$ = guiController.onClickInfoButtonObservable();
    const onClickEvolveButton$ = guiController.onClickEvolveButtonObservable();
    const endTurn$ = guiController.endTurnObservable();

    const dragSeed$ = seedController.dragSeedObservable();
    const dropSeed$ = seedController.dropSeedObservable();
    const isMouseOverSeedContainer$ = seedController.mouseOverSeedContainerObservable();
    const isMouseOverFlowerSelection$ = seedController.mouseOverFlowerSelectionObservable();
    const pickedUpSeed$ = seedController.pickUpSeedObservable();

    const gameState$ = gameStateManager.nextStateObservable();
    const gameStateDelta$ = gameStateManager.nextDeltaObservable();

    const mapCamera$ = mapController.cameraObservable();

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

    const flowerTypesArray$ = gameState$.pipe(
        map(state => Object.keys(state.flowerTypes))
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

    dropSeed$
        .pipe(
            withLatestFrom(combineLatest([isMouseOverSeedContainer$, isMouseOverFlowerSelection$, gameState$, gameStateDelta$, mapCamera$, pickedUpSeed$]))
        ).subscribe(([droppedSeed, [isMouseOverSeedContainer, isMouseOverFlowerSelection, gameState, gameStateDelta, camera, pickedUpSeed]]) => {
            if (!isMouseOverSeedContainer && !isMouseOverFlowerSelection) {
                const tileXY = guiPositionToTileLocation(camera, droppedSeed.x, droppedSeed.y);
                const tile = gameState.getTileAt(tileXY.tileX, tileXY.tileY);
                if (tile != null) {
                    const isOtherSeedTypeBlockingTile = Object.keys(gameStateDelta.placedSeeds)
                        .filter(type => type != pickedUpSeed.type)
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
                                gameStateManager.placeSeed(pickedUpSeed.type, tile.index);
                            } else { // SEED_ORIGIN_MAP
                                gameStateManager.moveSeed(pickedUpSeed.type, pickedUpSeed.tileIndex!, tile.index);
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