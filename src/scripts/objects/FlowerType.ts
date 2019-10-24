interface Requirements {
    min: number;
    max: number;
}

export interface FlowerType {
    name: string;
    growthRate: number;
    nitrogenRequirements: Requirements;
    phosphorousRequirements: Requirements;
    potassiumRequirements: Requirements;
}