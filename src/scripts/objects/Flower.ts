export type FlowerMode = "Grow" | "Produce";

export interface Flower {
    x: number;
    y: number;
    type: string;
    amount: number;
    mode: FlowerMode;
};
