import { SoilColourConverter } from "../SoilColourConverter";
import { GameStateController } from "../controllers/GameStateController";
import { MapController } from "../controllers/MapController";
import { startWith, pairwise, distinctUntilChanged, withLatestFrom, map, filter } from "rxjs/operators";
import { GameState } from "../objects/GameState";
import { PlacedSeedWidget } from "../widgets/specific/PlacedSeedWidget";
import { TileWidget } from "../widgets/specific/TileWidget";
import { indexToMapCoordinates, getPlayerColour } from "../widgets/utils";
import { combineLatest } from "rxjs";
import { HeldObjectController } from "../controllers/HeldObjectController";
import { isRequirementsSatisfied } from "../deltaCalculators/helpers";
import { GameActionController, PlacedSeed } from "../controllers/GameActionController";
import { PlacedCloudWidget } from "../widgets/specific/PlacedCloudWidget";
import { COLOURS } from "../constants";
import { PlacedFlowerWidget } from "../widgets/specific/PlacedFlowerWidget";

export class MapView {
    scene: Phaser.Scene;
	soilColourConverter: SoilColourConverter;
	mapController: MapController;

    tileButtons: TileWidget[];
    flowerSprites: PlacedFlowerWidget[];
    mountainSprites: Phaser.GameObjects.Image[];
	riverSprites: Phaser.GameObjects.Image[];
	placedSeedSprites: Map<number, PlacedSeedWidget>;
	cloudSprites: PlacedCloudWidget[];
	placedCloudWidget: PlacedCloudWidget;

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
		this.mapController = mapController;
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

			this.placedCloudWidget = new PlacedCloudWidget(scene, 0, 0, COLOURS.BLACK)
				.setDepth(6)
				.setAlpha(0.6)
				.setVisible(false);
		});
    }

	setupTileSprites(gameState: GameState) {
		this.tileButtons.forEach(s => s.destroy());
		this.tileButtons = gameState.tiles.map((tile, index) => {
			return new TileWidget(this.scene, index, gameState.numTilesX, tile.soil, gameState.getTileWaterContent(tile), this.soilColourConverter);
		}).map(tileWidget => tileWidget.onClick(() =>
			this.mapController.clickTile(tileWidget.tileIndex)
		));
	}

	setupCloudSprites(gameState: GameState) {
		this.cloudSprites.forEach(s => s.destroy());
		this.cloudSprites = Object.keys(gameState.clouds)
			.filter(cloudKey => gameState.clouds[cloudKey].tileIndex >= 0)
			.map(cloudKey => {
				const location = indexToMapCoordinates(gameState.clouds[cloudKey].tileIndex, gameState.numTilesX);

				const player = Object.keys(gameState.players).find((playerId) => {
					const player = gameState.players[playerId];
					return player.cloudOwned.indexOf(cloudKey) !== -1
				});
				
				const img = new PlacedCloudWidget(this.scene, location.x * 48 - 24, location.y * 48 - 24, getPlayerColour(player))
					.setDepth(6);
				return img;
			});
	}

	setupFlowerSprites(gameState: GameState) {
		this.flowerSprites.forEach(s => s.destroy());
		this.flowerSprites = Object.keys(gameState.flowersMap).map((flowerKey) => {
			const flower = gameState.flowersMap[flowerKey];
			const playerId = Object.keys(gameState.players).find(playerKey => {
				return gameState.players[playerKey].flowers.indexOf(flowerKey) !== -1
			});
			const img = new PlacedFlowerWidget(this.scene, flower.x * 48 - 24, flower.y * 48 - 24, getPlayerColour(playerId));
			const flowerType = gameState.getFlowerType(flower);
			img.setScale(Math.min(1, 0.2 + 0.8 * flower.growth / flowerType.turnsUntilGrown));
			if (flower.growth >= flowerType.turnsUntilDead + flowerType.turnsUntilGrown) {
				img.startDyingAnimation(this.scene);
			}
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
				placedSeeds.getAllSeeds().forEach(placedSeed => {
					if (placedSeed.amount > 0) {
						this.addNewSeed(placedSeed, gameState);
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
		
		combineLatest(heldObjectController.heldSeedObservable(), gameStateController.gameStateObservable(), gameStateController.currentPlayerObservable())
			.subscribe(([pickedUpSeed, gameState, currentPlayerId]) => {
				if (pickedUpSeed != null) {
					for (let i = 0; i < gameState.tiles.length; i++) {
						const tile = gameState.tiles[i];

						const x = tile.index % gameState.numTilesX;
						const y = Math.floor(tile.index / gameState.numTilesX);
						
						const playerFlowers = gameState.players[currentPlayerId].flowers;
						const isPlaceable = gameState.getMountainAtTile(tile) == null
							&& gameState.getFlowerIndexAtTile(tile) == null
							&& gameState.getTilesAdjacent(x, y).some(adjacentTile => {
									const flowerAtTile = gameState.getFlowerIndexAtTile(adjacentTile);
									return flowerAtTile != null && playerFlowers.indexOf(flowerAtTile) !== -1
								}
							);
							
						const isViable = isRequirementsSatisfied(tile.soil, gameState.flowerTypes[pickedUpSeed.type]);

						this.tileButtons[tile.index].setPlacementState(isPlaceable ? "allowed": "blocked", isViable ? "viable" : "unviable");
					};
				}
			});

		heldObjectController.heldSeedObservable()
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
			
			combineLatest(gameActionController.placedCloudsObservable(), gameStateController.currentPlayerObservable()).pipe(
                withLatestFrom(gameStateController.gameStateObservable()),
            ).subscribe(([[placedClouds, playerId], gameState]) => {
				const playerCloud = gameState.players[playerId].cloudOwned;
				if (Object.keys(placedClouds).indexOf(playerCloud) !== -1) {
					const location = indexToMapCoordinates(placedClouds[playerCloud], gameState.numTilesX);
					this.placedCloudWidget.setVisible(true);
					this.placedCloudWidget.setPosition(location.x * 48 - 24, location.y * 48 - 24);
					this.placedCloudWidget.setPlayerColour(getPlayerColour(playerId))
				} else {
					this.placedCloudWidget.setVisible(false);
				}
            })
	}
	
	addNewSeed(placedSeed: PlacedSeed, gameState: GameState) {
		const location = indexToMapCoordinates(placedSeed.tileIndex, gameState.numTilesX);
		const placedSeedWidget = new PlacedSeedWidget(this.scene, 
			(location.x * 48) - 24, (location.y * 48) - 24, 
			48, 48, 
			placedSeed.amount, 
			getPlayerColour(placedSeed.ownerId)
		);
		
		this.placedSeedSprites.set(placedSeed.tileIndex, placedSeedWidget);
	}
}