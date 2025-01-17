import 'phaser'
import MainScene from './scenes/mainScene'
import PreloadScene from './scenes/preloadScene'
import UIScene from './scenes/uiScene'
import OverlayScene from './scenes/overlayScene'
import EvolveSeedScene from './scenes/evolveSeedScene'
import { GuiController } from './controllers/GuiController'
import { SelectedObjectController } from './controllers/SelectedObjectController'
import { MapController } from './controllers/MapController'
import { FlowerSelectionController } from './controllers/FlowerSelectionController'
import { EvolveSeedController } from './controllers/EvolveSeedController'
import { HeldObjectController } from './controllers/HeldObjectController'
import { GameStateController } from './controllers/GameStateController'
import { GameDeltaController } from './controllers/GameDeltaController'
import { setupConnectors } from './connectors/connectors'
import { GameActionController } from './controllers/GameActionController'
import MainMenuScene from './scenes/mainMenuScene'
import { MainMenuController } from './controllers/MainMenuController'
import { of } from 'rxjs'
import { flatMap } from 'rxjs/operators'
import { SavedGameController, SavedGameData } from './controllers/SavedGameController'

const DEFAULT_WIDTH = 1280
const DEFAULT_HEIGHT = 720

// @ts-ignore https://github.com/photonstorm/phaser/issues/4522
// still not working in 3.18.1 :/
const config: GameConfig = {
  backgroundColor: '#1668FF',
  scale: {
    parent: 'phaser-game',
    // mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT
  },
  scene: [MainMenuScene, PreloadScene, MainScene, UIScene, EvolveSeedScene, OverlayScene]
  // physics: {
  //   default: 'arcade',
  //   arcade: {
  //     debug: false,
  //     gravity: { y: 400 }
  //   }
  // }
}

window.addEventListener('load', () => {
  let game = new Phaser.Game(config);
})

export const gameStateController = new GameStateController();
export const gameDeltaController = new GameDeltaController();
export const gameActionController = new GameActionController();
export const selectedObjectController = new SelectedObjectController();
export const guiController = new GuiController();
export const mapController = new MapController();
export const flowerSelectionController = new FlowerSelectionController();
export const evolveSeedController = new EvolveSeedController();
export const heldObjectController = new HeldObjectController();
export const mainMenuController = new MainMenuController();
export const savedGameController = new SavedGameController(); 
setupConnectors(
  guiController,
  gameStateController,
  gameDeltaController,
  gameActionController,
  mapController,
  flowerSelectionController,
  selectedObjectController,
  evolveSeedController,
  heldObjectController,
  savedGameController
);

const savedGames = JSON.parse(localStorage.getItem("SavedGames") || "[]") as SavedGameData[];
savedGameController.setSavedGames(savedGames);
