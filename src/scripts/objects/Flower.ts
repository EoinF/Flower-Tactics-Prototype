export type FlowerMode = "Grow" | "Produce";

export interface Flower {
    index: number;
    x: number;
    y: number;
    type: string;
    growth: number;
};
