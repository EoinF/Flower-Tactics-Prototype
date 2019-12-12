import 'phaser'
import MainScene from './scenes/mainScene'
import PreloadScene from './scenes/preloadScene'
import UIScene from './scenes/uiScene'
import { GameStateManager } from './controllers/GameStateManager'
import { GuiController } from './controllers/GuiController'
import { SelectedObjectController } from './controllers/SelectedObjectController'
import { SeedController } from './controllers/SeedController'
import { MapController } from './controllers/MapController'
import { setupConnectors } from './connectors'
import { FlowerSelectionController } from './controllers/FlowerSelectionController'

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
  scene: [PreloadScene, MainScene, UIScene]
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
export const seedController = new SeedController();
export const flowerSelectionController = new FlowerSelectionController();
setupConnectors(guiController, gameStateManager, seedController, mapController, flowerSelectionController);
