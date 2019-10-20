import { GameState } from "../GameState";
import { SoilColourConverter } from "../SoilColourConverter";
import { SelectedTileView } from "./SelectedTileView";
import { GameStateManager } from "../GameStateManager";

export class MapView {
    selectedTileView: SelectedTileView;

    tileSprites: Phaser.GameObjects.Image[];
    flowerSprites: Phaser.GameObjects.Image[];
    mountainSprites: Phaser.GameObjects.Image[];
    riverSprites: Phaser.GameObjects.Image[];

    constructor(scene: Phaser.Scene, gameStateManager: GameStateManager, soilColourConverter: SoilColourConverter) {
        this.selectedTileView = new SelectedTileView(scene, gameStateManager);
        this.setupSprites(scene, gameStateManager.gameState, soilColourConverter);
        this.setupCallbacks(gameStateManager);
    }

    setupSprites(scene: Phaser.Scene, gameState: GameState, soilColourConverter: SoilColourConverter) {
        this.tileSprites = gameState.tiles.map((tile, index) => {
            const x = (index % gameState.numTilesX);
            const y = Math.floor(index / gameState.numTilesX);
            const img = scene.add.image(x * 48, y * 48, 'blank-tile');
            img.setTint(soilColourConverter.soilToColour(tile.soil).color);
            img.setData("x", x);
            img.setData("y", y);
            return img;
          });
          
          this.flowerSprites = gameState.flowers.map((flower) => {
            const x = flower.x * 48;
            const y = flower.y * 48;
            const img = scene.add.image(x, y, 'flower');
            img.setScale(flower.amount);
            return img;
          });
      
          this.mountainSprites = gameState.mountains.map((mountain) => {
            const x = mountain.x * 48;
            const y = mountain.y * 48;
            const img = scene.add.image(x, y, 'mountain');
            return img;
          });
          this.riverSprites = gameState.rivers.map((river) => {
            const x = river.x * 48;
            const y = river.y * 48;
            const img = scene.add.image(x, y, 'river');
            return img;
          });
    }

    setupCallbacks(gameStateManager: GameStateManager) {
        this.tileSprites.forEach(img => {
            img.setInteractive().on('pointerup', () => {
                this.selectedTileView.setActiveTile(
                    img.getData("x"),
                    img.getData("y")
                );
            });
        });

        gameStateManager.onChange(() => {
        });
    }
}