import { SoilColourConverter } from "../SoilColourConverter";
import { GameStateManager } from "../controllers/GameStateManager";
import { SelectedObjectController } from "../controllers/SelectedObjectController";
import { SeedController } from "../controllers/SeedController";
import { COLOURS } from "../widgets/generic/constants";
import { MapController } from "../controllers/MapController";
import { startWith, pairwise, distinctUntilChanged, withLatestFrom, first } from "rxjs/operators";
import { GameState } from "../objects/GameState";
import { PlacedSeedWidget } from "../widgets/specific/PlacedSeedWidget";

export class MapView {
    scene: Phaser.Scene;
	soilColourConverter: SoilColourConverter;

    tileSprites: Phaser.GameObjects.Image[];
    flowerSprites: Phaser.GameObjects.Image[];
    mountainSprites: Phaser.GameObjects.Image[];
	riverSprites: Phaser.GameObjects.Image[];
	placedSeedSprites: Map<number, PlacedSeedWidget>;

    constructor(
      scene: Phaser.Scene, 
      gameStateManager: GameStateManager, 
      soilColourConverter: SoilColourConverter,
      SelectedObjectController: SelectedObjectController,
	  seedController: SeedController,
	  mapController: MapController
    ) {
		this.scene = scene;
		this.soilColourConverter = soilColourConverter;
		this.tileSprites = [];
		this.flowerSprites = [];
		this.mountainSprites = [];
		this.riverSprites = [];
		this.placedSeedSprites = new Map<number, PlacedSeedWidget>();
        this.setupSprites(scene, gameStateManager);
        this.setupCallbacks(gameStateManager, SelectedObjectController, seedController, mapController);
    }

    setupSprites(scene: Phaser.Scene, gameStateManager: GameStateManager) {
		gameStateManager.loadMapObservable().subscribe((gameState) => {
			this.setupTileSprites(gameState);
			this.setupFlowerSprites(gameState);
		
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
			this.placedSeedSprites.clear();
		});
    }

	setupTileSprites(gameState: GameState) {
		this.tileSprites.forEach(s => s.destroy());
		this.tileSprites = gameState.tiles.map((tile, index) => {
			const {x, y} = this.indexToMapCoordinates(index, gameState.numTilesX);
			const img = this.scene.add.image(x * 48, y * 48, 'blank-tile');
			img.setTint(this.soilColourConverter.soilToColour(tile.soil).color);
			img.setData("x", x);
			img.setData("y", y);
			return img;
		});
	}

	setupFlowerSprites(gameState: GameState) {
		this.flowerSprites.forEach(s => s.destroy());
		this.flowerSprites = gameState.flowers.map((flower) => {
			const img = this.scene.add.image(flower.x * 48, flower.y * 48, 'flower');
			const flowerType = gameState.getFlowerType(flower);
			img.setScale(0.2 + 0.8 * flower.growth / flowerType.turnsUntilGrown);
			img.setData("x", flower.x);
			img.setData("y", flower.y);
			return img;
		});
	}

    indexToMapCoordinates(index: number, numTilesX: number) {
        return { 
          x: (index % numTilesX),
          y: Math.floor(index / numTilesX)
        };
    }

	setupCallbacks(
		gameStateManager: GameStateManager, selectedObjectController: SelectedObjectController, 
		seedController: SeedController, mapController: MapController
	) {
        this.tileSprites.forEach(img => {
            img.setInteractive().on('pointerup', () => {
                selectedObjectController.setSelectedTile(
                    img.getData("x"),
                    img.getData("y")
                );
            });
        });

        gameStateManager.nextStateObservable().subscribe((newState) => {
			this.tileSprites.forEach(img => {
				const tile = newState.getTileAt(img.getData("x"), img.getData("y"))!;
				img.setTint(this.soilColourConverter.soilToColour(tile.soil).color);
			});
			if (newState.flowers.length != this.flowerSprites.length) {
				this.setupFlowerSprites(newState);
			} else {
				this.flowerSprites.forEach(img => {
					const flower = newState.getFlowerAt(img.getData("x"), img.getData("y"))!;
					const flowerType = newState.getFlowerType(flower);
					img.setScale(0.2 + 0.8 * flower.growth / flowerType.turnsUntilGrown);
				});
			}
		});
		
		gameStateManager.nextDeltaObservable()
			.pipe(
				withLatestFrom(gameStateManager.nextStateObservable())
			)
			.subscribe(([newStateDelta, newState]) => {
				this.placedSeedSprites.forEach(sprite => sprite.destroy());
				this.placedSeedSprites.clear();
				Object.keys(newStateDelta.placedSeeds)
					.forEach(type => {
						newStateDelta.placedSeeds[type]
							.forEach((seedAmount, tileIndex) => {
								if (seedAmount > 0) {
									this.addNewSeed(tileIndex, type, seedAmount, newState, seedController);
								}
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
	
	addNewSeed(tileIndex: number, seedType: string, seedAmount: number, newState: GameState, seedController: SeedController) {
		const location = this.indexToMapCoordinates(tileIndex, newState.numTilesX);
		
		const placedSeedWidget = new PlacedSeedWidget(this.scene, location.x * 48, location.y * 48, seedAmount);
		placedSeedWidget.onClick((pointer: Phaser.Input.Pointer) => {
			seedController.pickUpSeed(seedType, pointer.x, pointer.y, 'SEED_ORIGIN_MAP');
			const currentSeedAmount = placedSeedWidget.getAmount();
			if (currentSeedAmount === 1) {
				this.placedSeedSprites.delete(tileIndex);
				placedSeedWidget.destroy();
					
				const subscription = seedController.resetPickedUpSeedObservable()
					.pipe(first())
					.subscribe(() => this.addNewSeed(tileIndex, seedType, 1, newState, seedController));
				seedController.dropSeedObservable()
					.pipe(first())
					.subscribe(() => subscription.unsubscribe());
			} else {
				placedSeedWidget.setAmount(seedAmount - 1);
			}
		});
		
		this.placedSeedSprites.set(tileIndex, placedSeedWidget);
	}
}