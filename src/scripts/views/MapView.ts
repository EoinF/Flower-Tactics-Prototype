import { GameState } from "../GameState";
import { SoilColourConverter } from "../SoilColourConverter";
import { GameStateManager } from "../GameStateManager";
import { SelectedTileController } from "../controllers/SelectedTileController";

export class MapView {
    soilColourConverter: SoilColourConverter;

    tileSprites: Phaser.GameObjects.Image[];
    flowerSprites: Phaser.GameObjects.Image[];
    mountainSprites: Phaser.GameObjects.Image[];
    riverSprites: Phaser.GameObjects.Image[];

    constructor(scene: Phaser.Scene, 
      gameStateManager: GameStateManager, 
      soilColourConverter: SoilColourConverter, 
      selectedTileController: SelectedTileController
    ) {
        this.soilColourConverter = soilColourConverter;
        this.setupSprites(scene, gameStateManager.gameState, soilColourConverter);
        this.setupCallbacks(gameStateManager, selectedTileController);
    }

    setupSprites(scene: Phaser.Scene, gameState: GameState, soilColourConverter: SoilColourConverter) {
        this.tileSprites = gameState.tiles.map((tile, index) => {
            const {x, y} = this.indexToMapCoordinates(index, gameState.numTilesX);
            const img = scene.add.image(x * 48, y * 48, 'blank-tile');
            img.setTint(soilColourConverter.soilToColour(tile.soil).color);
            img.setData("x", x);
            img.setData("y", y);
            return img;
          });
          
          this.flowerSprites = gameState.flowers.map((flower) => {
            const img = scene.add.image(flower.x * 48, flower.y * 48, 'flower');
            img.setScale(flower.amount / 100);
            img.setData("x", flower.x);
            img.setData("y", flower.y);
            img.setData("type", flower.type);
            return img;
          });
      
          this.mountainSprites = gameState.mountains.map((mountain) => {
            const img = scene.add.image(mountain.x * 48, mountain.y * 48, 'mountain');
            return img;
          });
          this.riverSprites = gameState.rivers.map((river) => {
            const img = scene.add.image(river.x * 48, river.y * 48, 'river');
            return img;
          });
    }

    indexToMapCoordinates(index: number, numTilesX: number) {
      return { 
        x: (index % numTilesX),
        y: Math.floor(index / numTilesX)
      };
    }

    setupCallbacks(gameStateManager: GameStateManager, selectedTileController: SelectedTileController) {
        this.tileSprites.forEach(img => {
            img.setInteractive().on('pointerup', () => {
                selectedTileController.setActiveTile(
                    img.getData("x"),
                    img.getData("y")
                );
            });
        });

        gameStateManager.onChange((newState) => {
          this.tileSprites.forEach(img => {
            const tile = newState.getTileAt(img.getData("x"), img.getData("y"));
            img.setTint(this.soilColourConverter.soilToColour(tile.soil).color);
          })
          this.flowerSprites.forEach(img => {
            const flower = newState.getFlowerByTypeAt(img.getData("type"), img.getData("x"), img.getData("y"));
            img.setScale(flower.amount / 100);
          })
        });
    }
}