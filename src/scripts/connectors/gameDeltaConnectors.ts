import { GameState } from "../objects/GameState";
import { StringMap } from "../types";
import { GameDeltaController } from "../controllers/GameDeltaController";
import { GameStateController } from "../controllers/GameStateController";
import { calculateRiverEffects } from "../deltaCalculators/calculateRiverDelta";
import { calculateFlowerEffects } from "../deltaCalculators/calculateFlowerDelta";
import { MapController } from "../controllers/MapController";
import { withLatestFrom } from "rxjs/operators";
import { GuiController } from "../controllers/GuiController";
import { HeldObjectController } from "../controllers/HeldObjectController";
import { indexToMapCoordinates } from "../widgets/utils";


export interface FlowerDelta {
    growth: number;
    isNourished: boolean;
}

export interface SoilDelta {
    nitrogen: number;
    phosphorous: number;
    potassium: number;
}

export interface SeedStatusDelta {
    type: string;
    progress: number;
    quantity: number;
}

export interface PlayerDelta {
    flowersToRemove: string[];
    seedStatusDelta: string[];
}

export interface GameStateDelta {
    tileSoilDelta: Array<SoilDelta>;
    flowerDelta: StringMap<FlowerDelta>;
    seedStatusDelta: StringMap<SeedStatusDelta>;
    placedSeeds: StringMap<Map<number, number>>;
    placedCloudTileIndex: number | null;
}

export function setupGameDeltaManager(
    gameStateController: GameStateController,
    gameDeltaController: GameDeltaController,
    guiController: GuiController,
    mapController: MapController,
    heldObjectController: HeldObjectController
) {
    const gameState$ = gameStateController.gameStateObservable();
    const gameStateDelta$ = gameDeltaController.gameDeltaObservable();
    const heldSeed$ = heldObjectController.heldSeedObservable();
    const heldClouds$ = heldObjectController.heldCloudObservable();
    const isHoldingShiftKey$ = guiController.isHoldingShiftKeyObservable();
    const clickTile$ = mapController.clickTileObservable()

    gameStateController.gameStateObservable().subscribe(gameState => {
        gameDeltaController.setDelta(calculateDelta(gameState))
    });
    
    clickTile$
        .pipe(
            withLatestFrom(
                gameState$,
                gameStateDelta$,
                heldSeed$,
                isHoldingShiftKey$
            )
        ).subscribe(([clickedTile, gameState, gameDelta, heldSeed, isHoldingShiftKey]) => {
            if (heldSeed != null) {
                const isOtherSeedTypeBlockingTile = Object.keys(gameDelta.placedSeeds)
                    .filter(type => type != heldSeed.type)
                    .some(type => {
                        return gameDelta.placedSeeds[type].has(clickedTile)
                            && gameDelta.placedSeeds[type].get(clickedTile)! > 0;
                    });

                const tile = gameState.tiles[clickedTile];
                const location = indexToMapCoordinates(clickedTile, gameState.numTilesX);
                const isFlowerBlockingTile = (gameState.getFlowerAtTile(tile) != null);
                const isMountainBlockingTile = (gameState.getMountainAtTile(tile) != null);

                const isFlowerAdjacent = gameState.getTilesAdjacent(location.x, location.y).some(
                    adjacentTile => {
                        return gameState.getFlowerAtTile(adjacentTile) != null
                    }
                );
                let placedSeeds = 0;
                gameDelta.placedSeeds[heldSeed.type].forEach(amount => {
                    placedSeeds += amount;
                });

                const hasSufficientSeeds = (gameState.seedStatus[heldSeed.type].quantity - placedSeeds) > 0;

                if (isOtherSeedTypeBlockingTile) {
                    guiController.createAlertMessage("Another type of seed is already placed on this tile.");
                } else if (isFlowerBlockingTile) {
                    guiController.createAlertMessage("A flower is blocking seed placement.");
                } else if (isMountainBlockingTile) {
                    guiController.createAlertMessage("A mountain is blocking seed placement.");
                } else if (!isFlowerAdjacent) {
                    guiController.createAlertMessage("You can only place seeds near your existing flowers.");
                } else if (!hasSufficientSeeds) {
                    guiController.createAlertMessage("You don't have any seeds remaining.");
                } else {
                    if (isHoldingShiftKey) {
                        gameDeltaController.setDelta(removeSeed(gameDelta, heldSeed.type, clickedTile));
                    } else {
                        gameDeltaController.setDelta(placeSeed(gameDelta, heldSeed.type, clickedTile));
                    }
                }
            }
        });

    clickTile$
        .pipe(
            withLatestFrom(heldClouds$, gameStateDelta$)
        )
        .subscribe(([tileIndex, heldCloud, gameDelta]) => {
            if (heldCloud != null) {
                gameDeltaController.setDelta(placeClouds(gameDelta, tileIndex));
            }
        });
}

function generatePlacedSeedsMap(gameState: GameState) {
    const placedSeeds: StringMap<Map<number, number>> = {};
    
    Object.keys(gameState.flowerTypes).forEach(type => {
        placedSeeds[type] = new Map<number, number>();
    })
    return placedSeeds;
}

function getBlankSeedStatusDelta(gameState: GameState): StringMap<SeedStatusDelta> {
    const seedStatusDelta = {};
    Object.keys(gameState.seedStatus).forEach(
        key => {
            seedStatusDelta[key] = {type: key, quantity: 0, progress: 0};
        });
    return seedStatusDelta;
}

function generateFlowerDeltaMap(gameState: GameState): StringMap<FlowerDelta> {
    const flowerDeltaMap: StringMap<FlowerDelta> = {};
    Object.keys(gameState.flowersMap).forEach(key => {
        flowerDeltaMap[key] = {
            growth: 0, isNourished: false
        };
    });

    return flowerDeltaMap;
}

function getBlankDelta(gameState: GameState): GameStateDelta {
    return {
        flowerDelta: generateFlowerDeltaMap(gameState),
        tileSoilDelta: generateSoilDeltaMap(gameState),
        seedStatusDelta: getBlankSeedStatusDelta(gameState),
        placedSeeds: generatePlacedSeedsMap(gameState),
        placedCloudTileIndex: null
    };
}

function generateSoilDeltaMap(gameState: GameState): Array<SoilDelta> {
    return gameState.tiles.map((tile) => {
        if (tile.waterContent === 0 || tile.waterContent >= 10) {
            return {
                nitrogen: -25,
                potassium: -25,
                phosphorous: -25
            }
        } else {
            return {
                nitrogen: 0,
                potassium: 0,
                phosphorous: 0
            }
        }
    });
}

function calculateDelta(state: GameState) {
    const delta = getBlankDelta(state);
    calculateRiverEffects(state, delta);
    calculateFlowerEffects(state, delta);
    return delta;
}

function placeSeed(delta: GameStateDelta, type: string, tileIndex: number) {
    delta.seedStatusDelta[type].quantity--;
    _addSeed(delta, type, tileIndex);
    return delta;
}

function placeClouds(delta: GameStateDelta, tileIndex: number) {
    delta.placedCloudTileIndex = tileIndex;
    return delta;
}

function removeSeed(delta: GameStateDelta, type: string, tileIndex: number) {
    if (delta.placedSeeds[type].get(tileIndex) != null && delta.placedSeeds[type].get(tileIndex)! > 0) {
        delta.seedStatusDelta[type].quantity++;
        _removeSeed(delta, type, tileIndex);
    }
    return delta;
}

function _addSeed(delta: GameStateDelta, type: string, tileIndex: number) {
    let existingAmount = 0;
    if (delta.placedSeeds[type].has(tileIndex)) {
        existingAmount = delta.placedSeeds[type].get(tileIndex)!;
    }
    delta.placedSeeds[type].set(tileIndex, existingAmount + 1);
}
function _removeSeed(delta: GameStateDelta, type: string, tileIndex: number) {
    delta.placedSeeds[type].set(tileIndex, delta.placedSeeds[type].get(tileIndex)! -1);
}

export {
    placeSeed,
    removeSeed,
    placeClouds
}