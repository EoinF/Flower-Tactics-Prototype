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
    soil: Soil;

    constructor(soil: Soil = DEFAULT_SOIL) {
        this.soil = {...soil};
    }
}