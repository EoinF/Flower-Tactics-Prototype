import { withLatestFrom } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { GameState } from './objects/GameState';
import { GuiController } from './controllers/GuiController';
import { GameStateManager } from './controllers/GameStateManager';
import { SeedController } from './controllers/SeedController';
import { MapController } from './controllers/MapController';

function guiPositionToTile(gameState: GameState, camera: Phaser.Cameras.Scene2D.Camera, x: number, y: number) {
    const {
        x: worldX,
        y: worldY
    } = camera.getWorldPoint(x, y);
    const tileX = Math.floor((worldX + 24) / 48);
    const tileY = Math.floor((worldY + 24) / 48);
    return gameState.getTileAt(tileX, tileY);
}

export function setupConnectors(guiController: GuiController, gameStateManager: GameStateManager, seedController: SeedController, mapController: MapController) {
    const endTurn$ = guiController.endTurnObservable();
    const dragSeed$ = seedController.dragSeedObservable();
    const dropSeed$ = seedController.dropSeedObservable();
    const gameState$ = gameStateManager.nextStateObservable();
    const mapCamera$ = mapController.cameraObservable();
    const isMouseOverSeedContainer$ = seedController.mouseOverSeedContainerObservable();

    endTurn$.subscribe(() => {
        gameStateManager.nextState();
    });

    dropSeed$
        .pipe(
            withLatestFrom(combineLatest([isMouseOverSeedContainer$, gameState$, mapCamera$]))
        ).subscribe(([droppedSeed, [isMouseOverSeedContainer, gameState, camera]]) => {
            if (!isMouseOverSeedContainer) {
                const tile = guiPositionToTile(gameState, camera, droppedSeed.x, droppedSeed.y);

                if (tile != null) {
                    gameStateManager.placeSeed(droppedSeed.type, tile.index);
                }
            }
        });

    combineLatest(dragSeed$, mapCamera$, isMouseOverSeedContainer$)
        .pipe(
            withLatestFrom(gameState$),
        ).subscribe(([[draggedSeed, camera, isMouseOverContainer], gameState]) => {
            if (draggedSeed != null) {
                const tile = guiPositionToTile(gameState, camera, draggedSeed.x, draggedSeed.y);

                if (!isMouseOverContainer && tile != null) {
                    mapController.dragSeedOverTile(tile);
                    return;
                }
            }
            mapController.dragSeedOverTile(null);
        });
}