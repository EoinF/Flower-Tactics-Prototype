import { withLatestFrom, map, filter, startWith, pairwise } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
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
import { setupAnalyticsConnectors } from './analyticsConnectors';
import { SavedGameController } from '../controllers/SavedGameController';
import { setupGameSaverConnectors } from './gameSaverConnectors';
import { mainMenuController } from '../game';

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
    heldObjectController: HeldObjectController,
    savedGameController: SavedGameController
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
    setupAIConnectors(gameStateController, gameActionController, evolveSeedController);
    setupGameSaverConnectors(gameStateController, savedGameController);
    setupAnalyticsConnectors(mainMenuController, guiController, evolveSeedController, flowerSelectionController, gameActionController);

    combineLatest(gameState$, currentPlayer$).pipe(
        map(([state, currentPlayerId]) => state.players[currentPlayerId as string].seedsOwned),
        startWith<string[]>([]),
        pairwise(),
        filter(([previous, current]) => previous.length != current.length || current.some(curr => previous.indexOf(curr) === -1)),
        map(([prev, current]) => current)
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