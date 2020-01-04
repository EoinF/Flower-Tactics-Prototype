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
    waterContent: number;
    index: number;
    soil: Soil;

    constructor(index: number, waterContent: number, soil: Soil = DEFAULT_SOIL) {
        this.waterContent = waterContent;
        this.index = index;
        this.soil = {...soil};
    }
}