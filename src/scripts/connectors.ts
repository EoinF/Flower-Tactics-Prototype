import { withLatestFrom, map } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { GameState } from './objects/GameState';
import { GuiController } from './controllers/GuiController';
import { GameStateManager } from './controllers/GameStateManager';
import { SeedController } from './controllers/SeedController';
import { MapController } from './controllers/MapController';

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

export function setupConnectors(guiController: GuiController, gameStateManager: GameStateManager, seedController: SeedController, mapController: MapController) {
    const endTurn$ = guiController.endTurnObservable();
    const dragSeed$ = seedController.dragSeedObservable();
    const dropSeed$ = seedController.dropSeedObservable();
    const gameState$ = gameStateManager.nextStateObservable();
    const mapCamera$ = mapController.cameraObservable();
    const isMouseOverSeedContainer$ = seedController.mouseOverSeedContainerObservable();
    const pickUpSeed$ = seedController.pickUpSeedObservable();

    endTurn$.subscribe(() => {
        gameStateManager.nextState();
    });

    const pickedUpSeedTileLocation$ = pickUpSeed$.pipe(
        withLatestFrom(mapCamera$),
        map(([pickedUpSeed, camera]) => {
            const tileXY = guiPositionToTileLocation(camera, pickedUpSeed.x, pickedUpSeed.y);
            return {
                x: tileXY.tileX,
                y: tileXY.tileY,
                type: pickedUpSeed.type,
                origin: pickedUpSeed.origin
            }
        })
    )

    dropSeed$
        .pipe(
            withLatestFrom(combineLatest([isMouseOverSeedContainer$, gameState$, mapCamera$, pickedUpSeedTileLocation$]))
        ).subscribe(([droppedSeed, [isMouseOverSeedContainer, gameState, camera, pickedUpSeed]]) => {
            if (!isMouseOverSeedContainer) {
                const tileXY = guiPositionToTileLocation(camera, droppedSeed.x, droppedSeed.y);
                const tile = gameState.getTileAt(tileXY.tileX, tileXY.tileY);

                if (tile != null) {
                    if (pickedUpSeed.origin == 'SEED_ORIGIN_INVENTORY') {
                        gameStateManager.placeSeed(droppedSeed.type, tile.index);
                    } else { // SEED_ORIGIN_MAP
                        const pickedUpTile = gameState.getTileAt(pickedUpSeed.x, pickedUpSeed.y)!;
                        gameStateManager.moveSeed(droppedSeed.type, pickedUpTile.index, tile.index);
                    }
                    return;
                }
            } else if (pickedUpSeed.origin == 'SEED_ORIGIN_MAP') {
                const pickedUpTile = gameState.getTileAt(pickedUpSeed.x, pickedUpSeed.y);
                if (pickedUpTile != null) {
                    gameStateManager.removeSeed(pickedUpSeed.type, pickedUpTile.index);
                }
            }
            seedController.resetPickedUpSeed();
        });

    combineLatest(dragSeed$, mapCamera$, isMouseOverSeedContainer$)
        .pipe(
            withLatestFrom(gameState$),
        ).subscribe(([[draggedSeed, camera, isMouseOverContainer], gameState]) => {
            if (draggedSeed != null) {
                const tileXY = guiPositionToTileLocation(camera, draggedSeed.x, draggedSeed.y);
                const tile = gameState.getTileAt(tileXY.tileX, tileXY.tileY);

                if (!isMouseOverContainer && tile != null) {
                    mapController.dragSeedOverTile(tile);
                    return;
                }
            }
            mapController.dragSeedOverTile(null);
        });
}