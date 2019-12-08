import { NumberRange } from "../types";

export interface FlowerType {
    type: string;
    name: string;
    turnsUntilGrown: number;
    soilConsumptionRate: number,
    seedProductionRate: number,
    
    nitrogenRequirements: NumberRange;
    phosphorousRequirements: NumberRange;
    potassiumRequirements: NumberRange;
}