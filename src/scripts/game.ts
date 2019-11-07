import 'phaser'
import MainScene from './scenes/mainScene'
import PreloadScene from './scenes/preloadScene'
import UIScene from './scenes/uiScene'
import { GameStateManager } from './GameStateManager'
import { GuiController } from './controllers/GuiController'
import { SelectedTileController } from './controllers/SelectedTileController'
import { SeedController } from './controllers/SeedController'
import { MapController } from './controllers/MapController'

const DEFAULT_WIDTH = 1280
const DEFAULT_HEIGHT = 720

// @ts-ignore https://github.com/photonstorm/phaser/issues/4522
// still not working in 3.18.1 :/
const config: GameConfig = {
  backgroundColor: '#ffffff',
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
export const selectedTileController = new SelectedTileController();
export const guiController = new GuiController(gameStateManager);
export const mapController = new MapController(gameStateManager);
export const seedController = new SeedController(mapController);
