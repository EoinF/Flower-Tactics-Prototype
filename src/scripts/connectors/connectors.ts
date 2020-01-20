import { withLatestFrom, map, filter, flatMap, first } from 'rxjs/operators';
import { combineLatest, merge } from 'rxjs';
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
    const onClickInfoButton$ = guiController.onClickInfoButtonObservable();
    const isMouseOverSeedContainer$ = guiController.mouseOverSeedContainerObservable();
    const isMouseOverFlowerSelection$ = guiController.mouseOverFlowerSelectionObservable();
    const mousePosition$ = guiController.mousePositionObservable();

    const gameState$ = gameStateController.gameStateObservable();
    const currentPlayer$ = gameStateController.currentPlayerObservable();

    const mapCamera$ = mapController.cameraObservable();

    const selectedFlowerIndex$ = flowerSelectionController.selectedFlowerIndexObservable();

    setupGameStateManager(gameStateController, gameDeltaController, gameActionController, guiController, evolveSeedController);
    setupGameDeltaManager(gameStateController, gameDeltaController, gameActionController);
    setupGameInputConnectors(gameStateController, gameDeltaController, heldObjectController, guiController, mapController, gameActionController);

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