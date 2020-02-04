import { Soil } from "./objects/Tile";
import { NITROGEN_VALUE_RANGE, POTASSIUM_VALUE_RANGE, PHOSPHOROUS_VALUE_RANGE } from "./constants";

const minHue = 0.2;
const maxHue = 0.6;

const minLuminosity = 0.2;
const maxLuminosity = 0.5;

const minSaturation = 0.2;
const maxSaturation = 0.6;

export class SoilColourConverter {
    soilToColour(soil: Soil): Phaser.Display.Color {
        const hue = (54 / 240) * (1 - soil.phosphorousContent / PHOSPHOROUS_VALUE_RANGE.max);
        const luminosity = (1 - soil.nitrogenContent / NITROGEN_VALUE_RANGE.max);
        const saturation = ((10 * soil.potassiumContent / POTASSIUM_VALUE_RANGE.max) - luminosity - hue) / 8;

        const finalHue = minHue * (54 / 240) + (hue * (maxHue - minHue));
        const finalSaturation = minSaturation + (saturation * (maxSaturation - minSaturation));
        const finalLuminosity = minLuminosity + (luminosity * (maxLuminosity - minLuminosity));

        return Phaser.Display.Color.HSLToColor(
            finalHue,
            finalSaturation,
            finalLuminosity
        );
    }
}