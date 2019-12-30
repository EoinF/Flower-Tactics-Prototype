import { SoilColourConverter } from "../SoilColourConverter";
import { GameStateManager } from "../controllers/GameStateManager";
import { SelectedObjectController } from "../controllers/SelectedObjectController";
import { SeedController } from "../controllers/SeedController";
import { MapController } from "../controllers/MapController";
import { startWith, pairwise, distinctUntilChanged, withLatestFrom, first, timeout, flatMap, filter, map } from "rxjs/operators";
import { GameState } from "../objects/GameState";
import { PlacedSeedWidget } from "../widgets/specific/PlacedSeedWidget";
import { TileWidget } from "../widgets/specific/TileWidget";
import { indexToMapCoordinates } from "../widgets/utils";
import { combineLatest } from "rxjs";

export class MapView {
    scene: Phaser.Scene;
	soilColourConverter: SoilColourConverter;

    tileButtons: TileWidget[];
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
			return new TileWidget(this.scene, index, gameState.numTilesX, tile.soil, this.soilColourConverter);
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

	setupCallbacks(
		gameStateManager: GameStateManager, selectedObjectController: SelectedObjectController, 
		seedController: SeedController, mapController: MapController
	) {
        this.tileButtons.forEach(button => {
            button.onClick(() => {
                selectedObjectController.setSelectedTile(
                    button.tileX,
                    button.tileY
                );
            });
        });

        gameStateManager.nextStateObservable().subscribe((newState) => {
			this.tileButtons.forEach(button => {
				const tile = newState.getTileAt(button.tileX, button.tileY)!;
				button.setSoil(tile.soil);
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
		
		seedController.pickUpSeedObservable().pipe(
			withLatestFrom(gameStateManager.nextStateObservable())
		).subscribe(([pickedUpSeed, gameState]) => {
			for (let i = 0; i < gameState.tiles.length; i++) {
				const tile = gameState.tiles[i];
				const {
					nitrogenRequirements,
					potassiumRequirements,
					phosphorousRequirements
				} = gameState.flowerTypes[pickedUpSeed.type]

				const x = tile.index % gameState.numTilesX;
				const y = Math.floor(tile.index / gameState.numTilesX);
				const isPlaceable = (gameState.getMountainAtTile(tile) == null
					&& gameState.getFlowerAtTile(tile) == null)
					&& gameState.getTilesAdjacent(x, y).some(
						adjacentTile => gameState.getFlowerAtTile(adjacentTile) != null
					);
					
				const isViable = (
					nitrogenRequirements.min <= tile.soil.nitrogenContent && tile.soil.nitrogenContent <= nitrogenRequirements.max
					&& phosphorousRequirements.min <= tile.soil.phosphorousContent && tile.soil.phosphorousContent <= phosphorousRequirements.max
					&& potassiumRequirements.min <= tile.soil.potassiumContent && tile.soil.potassiumContent <= potassiumRequirements.max
				);

				this.tileButtons[tile.index].setState(isPlaceable ? "allowed": "blocked", isViable ? "viable" : "unviable");
			};
		});

		seedController.dropSeedObservable()
			.subscribe(() => {
				for (let i = 0; i < this.tileButtons.length; i++) {
					this.tileButtons[i].setState("n/a", "n/a");
				}
			});

		combineLatest(mapController.mouseOverTileObservable(), seedController.pickUpSeedObservable())
			.pipe(
				map(([tile, heldObject]) => heldObject === null ? null : tile),
				distinctUntilChanged(),
				startWith(null),
				pairwise()
			)
			.subscribe(([oldTile, newTile]) => {
				if (oldTile != null) {
					this.tileButtons[oldTile.index].setIsHovering(false);
				}
				if (newTile != null) {
					this.tileButtons[newTile.index].setIsHovering(true);
				}
			});
	}
	
	addNewSeed(tileIndex: number, seedType: string, seedAmount: number, newState: GameState, seedController: SeedController, selectedObjectController: SelectedObjectController) {
		const location = indexToMapCoordinates(tileIndex, newState.numTilesX);
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