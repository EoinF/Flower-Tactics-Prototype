export interface FlowerType {
    type: string;
    name: string;
    turnsUntilGrown: number;
    turnsUntilDead: number,
    seedProductionRate: number,
    tenacity: number;
    
    nitrogen: number;
    phosphorous: number;
    potassium: number;
}