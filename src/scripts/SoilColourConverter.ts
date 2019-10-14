import { Soil } from "./objects/Tile";


export class SoilColourConverter {
    private hueOffset: number;
    private baseSaturation: number;
    private luminosityOffset: number;

    constructor() {
        this.hueOffset = -30;
        this.baseSaturation = 60;
        this.luminosityOffset = 50;
    }
    
    colourToSoil(colour: Phaser.Display.Color): Soil {
        const phosphorousContent = 1 - (colour.h * 240 - this.hueOffset) / 54;
        const nitrogenContent = 1 - (colour.v * 240 - this.luminosityOffset) / 240;
        const potassiumContent = (colour.s * 240 - this.baseSaturation) / 240 - nitrogenContent - phosphorousContent;

        return {
            phosphorousContent,
            nitrogenContent,
            potassiumContent
        }
    }

    soilToColour(soil: Soil): Phaser.Display.Color {
        const hue = Math.max(0, this.hueOffset + 54 * (1 - soil.phosphorousContent));
        const saturation = this.baseSaturation + 240 * (soil.nitrogenContent + soil.phosphorousContent + soil.potassiumContent);
        const luminosity = this.luminosityOffset + 240 * (1 - soil.nitrogenContent);

        return Phaser.Display.Color.HSVToRGB(
            hue / 240,
            saturation / 240,
            luminosity / 240
        ) as Phaser.Display.Color;
    }
}