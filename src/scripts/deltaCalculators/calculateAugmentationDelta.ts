import { GameState } from "../objects/GameState";
import { GameStateDelta } from "../objects/GameStateDelta";

export function calculateAugmentationDelta(state: GameState, delta: GameStateDelta) {
    Object.keys(state.flowerAugmentations).forEach(flowerIndex => {
        const augmentations = state.flowerAugmentations[flowerIndex];
        augmentations.forEach((augmentation, index) => {
            if (augmentation.turnsRemaining == 0) {
                delta.addDelta( ['flowerAugmentations', flowerIndex], index, 'DELTA_REMOVE');
            } else {
                delta.addDelta(['flowerAugmentations', flowerIndex, index, 'turnsRemaining'], -1);
            }
        })
    })
}