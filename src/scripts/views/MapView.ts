import { GameState } from "../GameState";
import { SoilColourConverter } from "../SoilColourConverter";
import { GameStateManager } from "../GameStateManager";
import { SelectedTileController } from "../controllers/SelectedTileController";
import { SeedController } from "../controllers/SeedController";
import { COLOURS } from "../widgets/constants";
import { MapController } from "../controllers/MapController";

export class MapView {
    scene: Phaser.Scene;
	soilColourConverter: SoilColourConverter;

    tileSprites: Phaser.GameObjects.Image[];
    flowerSprites: Phaser.GameObjects.Image[];
    mountainSprites: Phaser.GameObjects.Image[];
	riverSprites: Phaser.GameObjects.Image[];
	placedSeedSprites: Phaser.GameObjects.Image[];

    constructor(
      scene: Phaser.Scene, 
      gameStateManager: GameStateManager, 
      soilColourConverter: SoilColourConverter,
      selectedTileController: SelectedTileController,
	  seedController: SeedController,
	  mapController: MapController
    ) {
		this.scene = scene;
        this.soilColourConverter = soilColourConverter;
        this.setupSprites(scene, gameStateManager.gameState, soilColourConverter);
        this.setupCallbacks(gameStateManager, selectedTileController, seedController, mapController);
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
		  this.placedSeedSprites = [];
    }

    indexToMapCoordinates(index: number, numTilesX: number) {
        return { 
          x: (index % numTilesX),
          y: Math.floor(index / numTilesX)
        };
    }

	setupCallbacks(
		gameStateManager: GameStateManager, selectedTileController: SelectedTileController, 
		seedController: SeedController, mapController: MapController
	) {
        this.tileSprites.forEach(img => {
            img.setInteractive().on('pointerup', () => {
                selectedTileController.setActiveTile(
                    img.getData("x"),
                    img.getData("y")
                );
            });
        });

        gameStateManager.onNextState((newState) => {
          this.tileSprites.forEach(img => {
            const tile = newState.getTileAt(img.getData("x"), img.getData("y"))!;
            img.setTint(this.soilColourConverter.soilToColour(tile.soil).color);
          })
          this.flowerSprites.forEach(img => {
            const flower = newState.getFlowerByTypeAt(img.getData("type"), img.getData("x"), img.getData("y"));
            img.setScale(flower.amount / 100);
		  });
		});
		
		gameStateManager.onNextDelta(newStateDelta => {
			this.placedSeedSprites.forEach(sprite => sprite.destroy());
			this.placedSeedSprites = [];
			Object.keys(newStateDelta.placedSeeds)
				.forEach(type => {
					newStateDelta.placedSeeds[type]
						.forEach(location => {
							this.placedSeedSprites.push(this.scene.add.image(location.x * 48, location.y * 48, "seed2"));
						})
				});
		})

		seedController.onDragSeedOverMap((type, x, y) => {
			const {
				x: worldX,
				y: worldY
			} = this.scene.cameras.main.getWorldPoint(x, y);
			const tileX = Math.floor((worldX + 24) / 48);
			const tileY = Math.floor((worldY + 24) / 48);
  
			const tile = gameStateManager.gameState.getTileAt(tileX, tileY);
			mapController.dragSeedOverTile(tile != null ? tile.index : null);
		});

		mapController.onDragSeedOverTile((newTileIndex, oldTileIndex) => {
			if (oldTileIndex != null) {
				const previousTile = gameStateManager.gameState.tiles[oldTileIndex];
				this.tileSprites[oldTileIndex].setTint(this.soilColourConverter.soilToColour(previousTile.soil).color);
			}

			if (newTileIndex != null) {
				const sprite = this.tileSprites[newTileIndex];
				sprite.setTint(COLOURS.PURPLE_200.color);
			}
		});

		seedController.onDropSeedOverMap((type, x, y) => {
			const {
				x: worldX,
				y: worldY
			} = this.scene.cameras.main.getWorldPoint(x, y);
			const tileX = Math.floor((worldX + 24) / 48);
			const tileY = Math.floor((worldY + 24) / 48);

			mapController.placeSeed(type, tileX, tileY);
		});
    }
}