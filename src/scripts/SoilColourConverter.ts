import { Soil } from "./objects/Tile";
import { HSLColor } from "./extensions";
import { NITROGEN_VALUE_RANGE, POTASSIUM_VALUE_RANGE, PHOSPHOROUS_VALUE_RANGE } from "./constants";

export class SoilColourConverter {
    colourToSoil(colour: HSLColor): Soil {
        let phosphorousRatio = (1 - colour.h * (240 / 54));
        let nitrogenRatio = (1 - colour.l);
        let potassiumRatio = (colour.s * 0.8 + colour.l * 0.1 + colour.h * 0.1);

        return {
            nitrogenContent: Math.round(nitrogenRatio * NITROGEN_VALUE_RANGE.max),
            phosphorousContent: Math.round(phosphorousRatio * PHOSPHOROUS_VALUE_RANGE.max),
            potassiumContent: Math.round(potassiumRatio * POTASSIUM_VALUE_RANGE.max)
        }
    }

    soilToColour(soil: Soil): Phaser.Display.Color {
        const hue = (54 / 240) * (1 - soil.phosphorousContent / PHOSPHOROUS_VALUE_RANGE.max);
        const luminosity = (1 - soil.nitrogenContent / NITROGEN_VALUE_RANGE.max);
        const saturation = ((10 * soil.potassiumContent / POTASSIUM_VALUE_RANGE.max) - luminosity - hue) / 8;

        return Phaser.Display.Color.HSLToColor(
            hue,
            saturation,
            luminosity
        );
    }
}