import { SoilColourConverter } from "../SoilColourConverter";
import { GameStateController } from "../controllers/GameStateController";
import { MapController } from "../controllers/MapController";
import { startWith, pairwise, distinctUntilChanged, withLatestFrom, map, filter } from "rxjs/operators";
import { GameState } from "../objects/GameState";
import { PlacedSeedWidget } from "../widgets/specific/PlacedSeedWidget";
import { TileWidget } from "../widgets/specific/TileWidget";
import { indexToMapCoordinates } from "../widgets/utils";
import { combineLatest } from "rxjs";
import { HeldObjectController } from "../controllers/HeldObjectController";
import { isRequirementsSatisfied } from "../deltaCalculators/helpers";
import { GameActionController } from "../controllers/GameActionController";

export class MapView {
    scene: Phaser.Scene;
	soilColourConverter: SoilColourConverter;

    tileButtons: TileWidget[];
    flowerSprites: Phaser.GameObjects.Image[];
    mountainSprites: Phaser.GameObjects.Image[];
	riverSprites: Phaser.GameObjects.Image[];
	placedSeedSprites: Map<number, PlacedSeedWidget>;
	cloudSprites: Phaser.GameObjects.Image[];
	placedCloudWidget: Phaser.GameObjects.Image;

    constructor(
      scene: Phaser.Scene, 
	  gameStateController: GameStateController,
	  gameActionController: GameActionController,
      soilColourConverter: SoilColourConverter,
	  heldObjectController: HeldObjectController,
	  mapController: MapController
    ) {
		this.scene = scene;
		this.soilColourConverter = soilColourConverter;
		this.tileButtons = [];
		this.flowerSprites = [];
		this.mountainSprites = [];
		this.riverSprites = [];
		this.cloudSprites = [];
		this.placedSeedSprites = new Map<number, PlacedSeedWidget>();
        this.setupSprites(scene, gameStateController);
        this.setupCallbacks(gameStateController, gameActionController, mapController, heldObjectController);
    }

    setupSprites(scene: Phaser.Scene, gameStateController: GameStateController) {
		gameStateController.loadMapObservable().subscribe((gameState) => {
			this.setupTileSprites(gameState);
			this.setupFlowerSprites(gameState);
			this.setupCloudSprites(gameState);
		
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

			this.placedCloudWidget = scene.add.image(0, 0, 'cloud')
				.setDepth(5)
				.setAlpha(0.6)
				.setVisible(false);
		});
    }

	setupTileSprites(gameState: GameState) {
		this.tileButtons.forEach(s => s.destroy());
		this.tileButtons = gameState.tiles.map((tile, index) => {
			return new TileWidget(this.scene, index, gameState.numTilesX, tile.soil, gameState.getTileWaterContent(tile), this.soilColourConverter);
		});
	}

	setupCloudSprites(gameState: GameState) {
		this.cloudSprites.forEach(s => s.destroy());
		this.cloudSprites = Object.keys(gameState.clouds)
			.filter(key => gameState.clouds[key].tileIndex >= 0)
			.map(key => {
				const location = indexToMapCoordinates(gameState.clouds[key].tileIndex, gameState.numTilesX);
				const img = this.scene.add.image(location.x * 48, location.y * 48, 'cloud')
					.setDepth(6);
				return img;
			});
	}

	setupFlowerSprites(gameState: GameState) {
		this.flowerSprites.forEach(s => s.destroy());
		this.flowerSprites = gameState.flowers.map((flower) => {
			const img = this.scene.add.image(flower.x * 48, flower.y * 48, 'flower');
			const flowerType = gameState.getFlowerType(flower);
			img.setScale(Math.min(1, 0.2 + 0.8 * flower.growth / flowerType.turnsUntilGrown));
			img.setDepth(5);
			img.setData("x", flower.x);
			img.setData("y", flower.y);
			return img;
		});
	}

	setupCallbacks(
		gameStateController: GameStateController, gameActionController: GameActionController,
		mapController: MapController, heldObjectController: HeldObjectController
	) {
        this.tileButtons.forEach(button => {
            button.onClick(() => {
				mapController.clickTile(button.tileIndex);
            });
        });

        gameStateController.gameStateObservable().subscribe((newState) => {
			this.tileButtons.forEach(button => {
				const tile = newState.getTileAt(button.tileX, button.tileY)!;
				button.setTileState(tile.soil, newState.getTileWaterContent(tile));
			});
			this.setupFlowerSprites(newState);
			this.setupCloudSprites(newState);
		});
		
		gameActionController.placedSeedsMapObservable()
			.pipe(
				withLatestFrom(gameStateController.gameStateObservable())
			)
			.subscribe(([placedSeeds, gameState]) => {
				this.placedSeedSprites.forEach(sprite => sprite.destroy());
				this.placedSeedSprites.clear();
				placedSeeds.forEach((placedSeed, tileIndex) => {
					if (placedSeed.amount > 0) {
						this.addNewSeed(tileIndex, placedSeed.type, placedSeed.amount, gameState, mapController);
					}
				});
			});

		combineLatest(
			heldObjectController.isHoldingCloudObservable(),
			gameStateController.gameStateObservable()
		).subscribe(([isHoldingCloud, gameState]) => {
			if (isHoldingCloud) {
				for (let i = 0; i < gameState.tiles.length; i++) {
					const tile = gameState.tiles[i];
				
					this.tileButtons[tile.index].setTileState(tile.soil, gameState.getTileWaterContent(tile));
				};
			}
		});
		
		combineLatest(heldObjectController.heldSeedObservable(), gameStateController.gameStateObservable())
		.subscribe(([pickedUpSeed, gameState]) => {
			if (pickedUpSeed != null) {
				for (let i = 0; i < gameState.tiles.length; i++) {
					const tile = gameState.tiles[i];

					const x = tile.index % gameState.numTilesX;
					const y = Math.floor(tile.index / gameState.numTilesX);
					const isPlaceable = (gameState.getMountainAtTile(tile) == null
						&& gameState.getFlowerAtTile(tile) == null)
						&& gameState.getTilesAdjacent(x, y).some(
							adjacentTile => gameState.getFlowerAtTile(adjacentTile) != null
						);
						
					const isViable = isRequirementsSatisfied(tile.soil, gameState.flowerTypes[pickedUpSeed.type]);

					this.tileButtons[tile.index].setPlacementState(isPlaceable ? "allowed": "blocked", isViable ? "viable" : "unviable");
				};
			}
		});

		heldObjectController.heldObjectObservable()
			.pipe(filter(heldObject => heldObject == null))
			.subscribe(() => {
				for (let i = 0; i < this.tileButtons.length; i++) {
					this.tileButtons[i].setPlacementState("n/a", "n/a");
				}
			});

		combineLatest(mapController.mouseOverTileObservable(), heldObjectController.heldSeedObservable())
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
			
			gameActionController.placedCloudsObservable().pipe(
                withLatestFrom(gameStateController.currentPlayerObservable(), gameStateController.gameStateObservable()),
            ).subscribe(([placedClouds, playerId, gameState]) => {
				const playerCloud = gameState.players[playerId].cloudOwned;
				if (Object.keys(placedClouds).indexOf(playerCloud) !== -1) {
					const location = indexToMapCoordinates(placedClouds[playerCloud], gameState.numTilesX);
					this.placedCloudWidget.setVisible(true);
					this.placedCloudWidget.setPosition(location.x * 48, location.y * 48);
				} else {
					this.placedCloudWidget.setVisible(false);
				}
            })
	}
	
	addNewSeed(tileIndex: number, seedType: string, seedAmount: number, newState: GameState, mapController: MapController) {
		const location = indexToMapCoordinates(tileIndex, newState.numTilesX);
		const placedSeedWidget = new PlacedSeedWidget(this.scene, (location.x * 48) - 24, (location.y * 48) - 24, 48, 48, seedAmount);
		placedSeedWidget.onClick(() => {
			mapController.clickTile(tileIndex);
		});
		
		this.placedSeedSprites.set(tileIndex, placedSeedWidget);
	}
}