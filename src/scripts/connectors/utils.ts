import { GameState } from "../objects/GameState";
import { Tile } from "../objects/Tile";
import { PlacedSeed, SeedTypeToPlacedSeedsMap } from "../controllers/GameActionController";
import { indexToMapCoordinates } from "../widgets/utils";

export type SeedPlacementErrorStatus = "FLOWER_BLOCKING" | "MOUNTAIN_BLOCKING" | "ADJACENT_FLOWER_REQUIRED" | 
    "OTHER_SEED_TYPE_BLOCKING" | "INSUFFICIENT_SEEDS_REMAINING";

export type SeedPlacementStatus =  "PLACEMENT_ALLOWED" | SeedPlacementErrorStatus;


export function getPlacementStatus(tile: Tile, gameState: GameState, playerId: string, 
    placedSeedsMap: SeedTypeToPlacedSeedsMap, seedType: string
): SeedPlacementStatus {
    let playerOwnedSeedAmountOnTile = 0;
    let playerOwnedTypeOnTile: string | null = null;
    
    placedSeedsMap.getSeedsAtTile(tile.index).forEach(placedSeed => {
        if (gameState.players[playerId].seedsOwned.indexOf(placedSeed.type) !== -1 && placedSeed.amount > 0) {
            playerOwnedSeedAmountOnTile = placedSeed.amount;
            playerOwnedTypeOnTile = placedSeed.type;
        }
    });

    const isOtherOwnedSeedTypeBlockingTile = playerOwnedTypeOnTile != null && playerOwnedTypeOnTile !== seedType;

    const isMountainBlockingTile = (gameState.getMountainAtTile(tile) != null);

    const playerFlowers = gameState.players[playerId].flowers;
    const { x, y } = indexToMapCoordinates(tile.index, gameState.numTilesX);
    const isFlowerBlockingTile = (gameState.getFlowerIndexAtTile(tile) != null);
    const isFlowerAdjacent = gameState.getTilesAdjacent(x, y).some(adjacentTile => {
        const flowerAtTile = gameState.getFlowerIndexAtTile(adjacentTile);
        return flowerAtTile != null && playerFlowers.indexOf(flowerAtTile) !== -1
    });

    let placedSeedsAmount = 0;
    placedSeedsMap.getAllSeeds().forEach(placedSeed => {
        if (placedSeed.type === seedType) {
            placedSeedsAmount += placedSeed.amount;
        }
    });
    const hasSufficientSeeds = (gameState.seedStatus[seedType].quantity - placedSeedsAmount) > 0;
    const tileHasSeeds = playerOwnedSeedAmountOnTile > 0;

    if (isFlowerBlockingTile) {
        return "FLOWER_BLOCKING";
    } else if (isMountainBlockingTile) {
        return "MOUNTAIN_BLOCKING"
    } else if (!isFlowerAdjacent) {
        return "ADJACENT_FLOWER_REQUIRED";
    } else {
        if (isOtherOwnedSeedTypeBlockingTile) {
            return "OTHER_SEED_TYPE_BLOCKING"
        } else if (!hasSufficientSeeds) {
            return "INSUFFICIENT_SEEDS_REMAINING";
        }
    }
    return "PLACEMENT_ALLOWED";
}