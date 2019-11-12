import { GameState } from "../objects/GameState";
import { GameStateDelta } from "../controllers/GameStateManager";

export function revertSeedPlacementDelta(gameState: GameState, gameStateDelta: GameStateDelta, type: string, tileIndex: number) {
    _calculateSeedPlacementDelta(gameState, gameStateDelta, type, tileIndex, -1)
}
export function calculateSeedPlacementDelta(gameState: GameState, gameStateDelta: GameStateDelta, type: string, tileIndex: number) {
    _calculateSeedPlacementDelta(gameState, gameStateDelta, type, tileIndex, +1)
}

function _calculateSeedPlacementDelta(gameState: GameState, gameStateDelta: GameStateDelta, type: string, tileIndex: number, sign: number) {
    gameStateDelta.seedStatusDelta[type].quantity -= sign;

    // Check if the same flower already exists on this tile
    const tile = gameState.tiles[tileIndex];
    const flowerTypeStats = gameState.flowerTypes[type];
    const flowerOfSameType = gameState.getFlowerByTypeAtTile(type, tile);

    if (flowerOfSameType != null) {
        const delta = gameStateDelta.flowerDelta[flowerOfSameType.index];
    
        if (delta != null) {
            delta.amount += flowerTypeStats.plantingAmount * sign;
        }
    } else {
        const existingDelta = gameStateDelta.newFlowerDelta
                .find(existing => existing.type == type && existing.tileIndex == tileIndex)!;
        if (existingDelta == null) {
            gameStateDelta.newFlowerDelta.push({
                type,
                amount: flowerTypeStats.plantingAmount,
                tileIndex
            });
        } else {
            existingDelta.amount += flowerTypeStats.plantingAmount * sign;
        }
    }
}