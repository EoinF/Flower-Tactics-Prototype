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
    soil: Soil;

    constructor(index: number, soil: Soil = DEFAULT_SOIL) {
        this.index = index;
        this.soil = {...soil};
    }
}