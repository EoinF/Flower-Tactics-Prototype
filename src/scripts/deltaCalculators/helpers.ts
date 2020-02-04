import { Soil } from "../objects/Tile";

interface SoilRequirements {
    nitrogen: number;
    phosphorous: number;
    potassium: number;
}

export function isRequirementsSatisfied(soil: Soil, soilRequirements: SoilRequirements) {
    const {
        nitrogen,
        phosphorous,
        potassium
    } = soilRequirements;
    return nitrogen === soil.nitrogenContent
        && phosphorous === soil.phosphorousContent
        && potassium === soil.potassiumContent
}