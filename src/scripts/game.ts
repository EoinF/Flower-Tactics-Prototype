import 'phaser'
import MainScene from './scenes/mainScene'
import PreloadScene from './scenes/preloadScene'
import UIScene from './scenes/uiScene'
import OverlayScene from './scenes/overlayScene'
import EvolveSeedScene from './scenes/evolveSeedScene'
import { GameStateManager } from './controllers/GameStateManager'
import { GuiController } from './controllers/GuiController'
import { SelectedObjectController } from './controllers/SelectedObjectController'
import { MapController } from './controllers/MapController'
import { setupConnectors } from './connectors'
import { FlowerSelectionController } from './controllers/FlowerSelectionController'
import { EvolveSeedController } from './controllers/EvolveSeedController'
import { HeldObjectController } from './controllers/HeldObjectController'

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
  scene: [PreloadScene, MainScene, UIScene, OverlayScene, EvolveSeedScene]
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

export const gameStateManager = new GameStateManager(0);
export const selectedObjectController = new SelectedObjectController();
export const guiController = new GuiController();
export const mapController = new MapController();
export const flowerSelectionController = new FlowerSelectionController();
export const evolveSeedController = new EvolveSeedController();
export const heldObjectController = new HeldObjectController();
setupConnectors(
  guiController,
  gameStateManager,
  mapController,
  flowerSelectionController,
  selectedObjectController,
  evolveSeedController,
  heldObjectController
);
