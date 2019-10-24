import { Flower } from "./Flower";

export const DEFAULT_SOIL = {
    nitrogenContent: 0,
    potassiumContent: 0,
    phosphorousContent: 0
}

export interface Soil {
    nitrogenContent: number;
    potassiumContent: number;
    phosphorousContent: number;
}

export class Tile {
    index: number;
    flowers: Flower[];
    soil: Soil;

    constructor(index: number, soil: Soil = DEFAULT_SOIL, flowers: Flower[] = []) {
        this.index = index;
        this.soil = {...soil};
        this.flowers = flowers;
    }
}