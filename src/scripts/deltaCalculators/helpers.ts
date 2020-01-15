import { Soil } from "../objects/Tile";

interface SoilRequirements {
    nitrogenMin: number;
    nitrogenMax: number;
    phosphorousMin: number;
    phosphorousMax: number;
    potassiumMin: number;
    potassiumMax: number;
}

export function isRequirementsSatisfied(soil: Soil, soilRequirements: SoilRequirements) {
    const {
        nitrogenMin, nitrogenMax,
        phosphorousMin, phosphorousMax,
        potassiumMin, potassiumMax
    } = soilRequirements;
    return nitrogenMin <= soil.nitrogenContent && soil.nitrogenContent <= nitrogenMax
        && phosphorousMin <= soil.phosphorousContent && soil.phosphorousContent <= phosphorousMax
        && potassiumMin <= soil.potassiumContent && soil.potassiumContent <= potassiumMax
}