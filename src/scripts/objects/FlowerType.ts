export interface FlowerType {
    type: string;
    name: string;
    turnsUntilGrown: number;
    soilConsumptionRate: number,
    seedProductionRate: number,
    tenacity: number;
    
    nitrogenMin: number;
    nitrogenMax: number;
    phosphorousMin: number;
    phosphorousMax: number;
    potassiumMin: number;
    potassiumMax: number;
}