interface Requirements {
    min: number;
    max: number;
}

export interface FlowerType {
    type: string;
    name: string;
    growthRate: number;
    plantingAmount: number;
    nitrogenRequirements: Requirements;
    phosphorousRequirements: Requirements;
    potassiumRequirements: Requirements;
}