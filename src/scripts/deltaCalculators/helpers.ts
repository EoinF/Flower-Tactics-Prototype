import { Soil } from "../objects/Tile";
import { NumberRange } from "../types";

interface SoilRequirements {
    nitrogenRequirements: NumberRange;
    phosphorousRequirements: NumberRange;
    potassiumRequirements: NumberRange;
}

export function isRequirementsSatisfied(soil: Soil, soilRequirements: SoilRequirements) {
    const {
        nitrogenRequirements,
        phosphorousRequirements,
        potassiumRequirements
    } = soilRequirements;
    return nitrogenRequirements.min <= soil.nitrogenContent && soil.nitrogenContent <= nitrogenRequirements.max
        && phosphorousRequirements.min <= soil.phosphorousContent && soil.phosphorousContent <= phosphorousRequirements.max
        && potassiumRequirements.min <= soil.potassiumContent && soil.potassiumContent <= potassiumRequirements.max
}