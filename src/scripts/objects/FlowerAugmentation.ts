type FlowerAugmentationType = "tenacity"

export interface FlowerAugmentation {
    type: FlowerAugmentationType;
    strength: number;
    turnsRemaining: number;
}