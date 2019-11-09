import { SoilColourConverter } from "../SoilColourConverter";
import { GameStateManager } from "../controllers/GameStateManager";
import { SelectedTileController } from "../controllers/SelectedTileController";
import { SeedController } from "../controllers/SeedController";
import { COLOURS } from "../widgets/constants";
import { MapController } from "../controllers/MapController";
import { startWith, pairwise, distinct, distinctUntilChanged, distinctUntilKeyChanged, take, tap, publish, withLatestFrom } from "rxjs/operators";
import { range, ReplaySubject } from "rxjs";

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
		this.tileSprites = [];
		this.flowerSprites = [];
		this.mountainSprites = [];
		this.riverSprites = [];
		this.placedSeedSprites = [];
        this.setupSprites(scene, gameStateManager, soilColourConverter);
        this.setupCallbacks(gameStateManager, selectedTileController, seedController, mapController);
    }

    setupSprites(scene: Phaser.Scene, gameStateManager: GameStateManager, soilColourConverter: SoilColourConverter) {
		gameStateManager.loadMapObservable().subscribe((gameState) => {
			this.tileSprites.forEach(s => s.destroy());
			this.tileSprites = gameState.tiles.map((tile, index) => {
				const {x, y} = this.indexToMapCoordinates(index, gameState.numTilesX);
				const img = scene.add.image(x * 48, y * 48, 'blank-tile');
				img.setTint(soilColourConverter.soilToColour(tile.soil).color);
				img.setData("x", x);
				img.setData("y", y);
				return img;
			});
			
			this.flowerSprites.forEach(s => s.destroy());
			this.flowerSprites = gameState.flowers.map((flower) => {
				const img = scene.add.image(flower.x * 48, flower.y * 48, 'flower');
				img.setScale(flower.amount / 100);
				img.setData("x", flower.x);
				img.setData("y", flower.y);
				img.setData("type", flower.type);
				return img;
			});
		
			this.mountainSprites.forEach(s => s.destroy());
			this.mountainSprites = gameState.mountains.map((mountain) => {
				const img = scene.add.image(mountain.x * 48, mountain.y * 48, 'mountain');
				return img;
			});
			this.riverSprites.forEach(s => s.destroy());
			this.riverSprites = gameState.rivers.map((river) => {
				const img = scene.add.image(river.x * 48, river.y * 48, 'river');
				return img;
			});
			this.placedSeedSprites.forEach(s => s.destroy());
			this.placedSeedSprites = [];
		});
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

        gameStateManager.nextStateObservable().subscribe((newState) => {
          this.tileSprites.forEach(img => {
            const tile = newState.getTileAt(img.getData("x"), img.getData("y"))!;
            img.setTint(this.soilColourConverter.soilToColour(tile.soil).color);
          })
          this.flowerSprites.forEach(img => {
            const flower = newState.getFlowerByTypeAt(img.getData("type"), img.getData("x"), img.getData("y"));
            img.setScale(flower.amount / 100);
		  });
		});
		
		gameStateManager.nextDeltaObservable()
			.pipe(
				withLatestFrom(gameStateManager.nextStateObservable())
			)
			.subscribe(([newStateDelta, newState]) => {
				this.placedSeedSprites.forEach(sprite => sprite.destroy());
				this.placedSeedSprites = [];
				Object.keys(newStateDelta.placedSeeds)
					.forEach(type => {
						newStateDelta.placedSeeds[type]
							.forEach(tileIndex => {
								const location = this.indexToMapCoordinates(tileIndex, newState.numTilesX)
								this.placedSeedSprites.push(this.scene.add.image(location.x * 48, location.y * 48, "seed2"));
							})
					});
			});

		mapController.dragSeedOverTileObservable()
			.pipe(
				distinctUntilChanged(),
				startWith(null),
				pairwise()
			)
			.subscribe(([oldTile, newTile]) => {
				if (oldTile != null) {
					this.tileSprites[oldTile.index]
						.setTint(this.soilColourConverter.soilToColour(oldTile.soil).color);
				}

				if (newTile != null) {
					const sprite = this.tileSprites[newTile.index];
					sprite.setTint(COLOURS.PURPLE_200.color);
				}
			});
    }
}