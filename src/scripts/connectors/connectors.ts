import { withLatestFrom, map, filter, flatMap, first, distinctUntilChanged, mapTo, scan, tap, startWith } from 'rxjs/operators';
import { combineLatest, merge, of, Subject } from 'rxjs';
import { GuiController } from '../controllers/GuiController';
import { GameStateController } from '../controllers/GameStateController';
import { MapController } from '../controllers/MapController';
import { FlowerSelectionController } from '../controllers/FlowerSelectionController';
import { SelectedObjectController } from '../controllers/SelectedObjectController';
import { EvolveSeedController } from '../controllers/EvolveSeedController';
import { HeldObjectController } from '../controllers/HeldObjectController';
import { GameDeltaController } from '../controllers/GameDeltaController';
import { setupGameDeltaManager } from './gameDeltaConnectors';
import { setupGameStateManager } from './gameStateConnectors';
import { GameActionController } from '../controllers/GameActionController';
import { setupGameInputConnectors } from './gameInputConnectors';
import { setupAIConnectors } from './aiConnectors';

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
    gameStateController: GameStateController,
    gameDeltaController: GameDeltaController,
    gameActionController: GameActionController,
    mapController: MapController,
    flowerSelectionController: FlowerSelectionController,
    selectedObjectController: SelectedObjectController,
    evolveSeedController: EvolveSeedController,
    heldObjectController: HeldObjectController
) {
    const isMouseOverSeedContainer$ = guiController.mouseOverSeedContainerObservable();
    const isMouseOverFlowerSelection$ = guiController.mouseOverFlowerSelectionObservable();
    const mousePosition$ = guiController.mousePositionObservable();

    const gameState$ = gameStateController.gameStateObservable();
    const currentPlayer$ = gameStateController.currentPlayerObservable();

    const mapCamera$ = mapController.cameraObservable();

    setupGameStateManager(gameStateController, gameDeltaController, gameActionController, guiController, evolveSeedController);
    setupGameDeltaManager(gameStateController, gameDeltaController, gameActionController);
    setupGameInputConnectors(gameStateController, gameDeltaController, heldObjectController, guiController, mapController, gameActionController);
    setupAIConnectors(gameStateController, gameActionController);

    combineLatest(gameState$, currentPlayer$).pipe(
        map(([state, currentPlayerId]) => state.players[currentPlayerId as string].seedsOwned),
        distinctUntilChanged()
    ).subscribe(flowerTypes => {
        flowerSelectionController.setFlowerTypes(flowerTypes);
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
}