import { SoilColourConverter } from "../SoilColourConverter";
import { GameStateManager } from "../controllers/GameStateManager";
import { SelectedObjectController } from "../controllers/SelectedObjectController";
import { SeedController } from "../controllers/SeedController";
import { COLOURS } from "../widgets/generic/constants";
import { MapController } from "../controllers/MapController";
import { startWith, pairwise, distinctUntilChanged, withLatestFrom, first, filter } from "rxjs/operators";
import { GameState } from "../objects/GameState";
import { PlacedSeedWidget } from "../widgets/specific/PlacedSeedWidget";
import { Subject, merge, forkJoin } from "rxjs";
import { ImageButton } from "../widgets/generic/ImageButton";

export class MapView {
    scene: Phaser.Scene;
	soilColourConverter: SoilColourConverter;

    tileButtons: ImageButton[];
    flowerSprites: Phaser.GameObjects.Image[];
    mountainSprites: Phaser.GameObjects.Image[];
	riverSprites: Phaser.GameObjects.Image[];
	placedSeedSprites: Map<number, PlacedSeedWidget>;

    constructor(
      scene: Phaser.Scene, 
      gameStateManager: GameStateManager, 
      soilColourConverter: SoilColourConverter,
      selectedObjectController: SelectedObjectController,
	  seedController: SeedController,
	  mapController: MapController
    ) {
		this.scene = scene;
		this.soilColourConverter = soilColourConverter;
		this.tileButtons = [];
		this.flowerSprites = [];
		this.mountainSprites = [];
		this.riverSprites = [];
		this.placedSeedSprites = new Map<number, PlacedSeedWidget>();
        this.setupSprites(scene, gameStateManager);
        this.setupCallbacks(gameStateManager, selectedObjectController, seedController, mapController);
    }

    setupSprites(scene: Phaser.Scene, gameStateManager: GameStateManager) {
		gameStateManager.loadMapObservable().subscribe((gameState) => {
			this.setupTileSprites(gameState);
			this.setupFlowerSprites(gameState);
		
			this.mountainSprites.forEach(s => s.destroy());
			this.mountainSprites = gameState.mountains.map((mountain) => {
				const img = scene.add.image(mountain.x * 48, mountain.y * 48, 'mountain')
					.setDepth(5);
				return img;
			});
			this.riverSprites.forEach(s => s.destroy());
			this.riverSprites = gameState.rivers.map((river) => {
				const img = scene.add.image(river.x * 48, river.y * 48, 'river')
					.setDepth(5);
				return img;
			});
			this.placedSeedSprites.forEach(s => s.destroy());
			this.placedSeedSprites.clear();
		});
    }

	setupTileSprites(gameState: GameState) {
		this.tileButtons.forEach(s => s.destroy());
		this.tileButtons = gameState.tiles.map((tile, index) => {
			const {x, y} = this.indexToMapCoordinates(index, gameState.numTilesX);
			const button = new ImageButton(this.scene, x * 48 - 24, y * 48 - 24, "blank-tile");
			const colour = this.soilColourConverter.soilToColour(tile.soil);
			button.setBackground(colour, colour, colour, COLOURS.PURPLE_500);
			button.setData("x", x);
			button.setData("y", y);
			return button;
		});
	}

	setupFlowerSprites(gameState: GameState) {
		this.flowerSprites.forEach(s => s.destroy());
		this.flowerSprites = gameState.flowers.map((flower) => {
			const img = this.scene.add.image(flower.x * 48, flower.y * 48, 'flower');
			const flowerType = gameState.getFlowerType(flower);
			img.setScale(0.2 + 0.8 * flower.growth / flowerType.turnsUntilGrown);
			img.setDepth(5);
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
        this.tileButtons.forEach(button => {
            button.onClick(() => {
                selectedObjectController.setSelectedTile(
                    button.getData("x"),
                    button.getData("y")
                );
            });
        });

        gameStateManager.nextStateObservable().subscribe((newState) => {
			this.tileButtons.forEach(button => {
				const tile = newState.getTileAt(button.getData("x"), button.getData("y"))!;
				button.image.setTint(this.soilColourConverter.soilToColour(tile.soil).color);
			});
			if (newState.flowers.length != this.flowerSprites.length) {
				this.setupFlowerSprites(newState);
			} else {
				this.flowerSprites.forEach(img => {
					const flower = newState.getFlowerAt(img.getData("x"), img.getData("y"))!;
					const flowerType = newState.getFlowerType(flower);
					img.setScale(0.2 + 0.8 * flower.growth / flowerType.turnsUntilGrown)
						.setDepth(5);
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
									this.addNewSeed(tileIndex, type, seedAmount, newState, seedController, selectedObjectController);
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
					const colour = this.soilColourConverter.soilToColour(oldTile.soil);
					this.tileButtons[oldTile.index]
						.image.setTint(colour.color);
				}

				if (newTile != null) {
					this.tileButtons[newTile.index]
						.image.setTint(COLOURS.PURPLE_200.color);
				}
			});
	}
	
	addNewSeed(tileIndex: number, seedType: string, seedAmount: number, newState: GameState, seedController: SeedController, selectedObjectController: SelectedObjectController) {
		const location = this.indexToMapCoordinates(tileIndex, newState.numTilesX);
		const placedSeedWidget = new PlacedSeedWidget(this.scene, (location.x * 48) - 24, (location.y * 48) - 24, 48, 48, seedAmount);
		placedSeedWidget.onClick(() => {
			selectedObjectController.setSelectedTile(
				location.x,
				location.y
			);
		});
		placedSeedWidget.onHold(() => {
			seedController.pickUpSeed(seedType, tileIndex, 'SEED_ORIGIN_MAP');
			const currentSeedAmount = placedSeedWidget.getAmount();
			if (currentSeedAmount === 1) {
				this.placedSeedSprites.delete(tileIndex);
				placedSeedWidget.destroy();
					
				const subscription = seedController.resetPickedUpSeedObservable()
					.pipe(first())
					.subscribe(() => this.addNewSeed(tileIndex, seedType, 1, newState, seedController, selectedObjectController));
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