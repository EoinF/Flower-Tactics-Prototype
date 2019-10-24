import { Soil } from "./objects/Tile";
import { HSLColor } from "./extensions";


export class SoilColourConverter {
    private maxNitrogen: number;
    private maxPotassium: number;
    private maxPhosphorous: number;

    constructor() {
        this.maxNitrogen = 0.2;
        this.maxPhosphorous = 0.2;
        this.maxPotassium = 0.2;
    }
    
    colourToSoil(colour: HSLColor): Soil {
        let phosphorousContent = (1 - colour.h * (240 / 54)) * this.maxPhosphorous;
        let nitrogenContent = (1 - colour.l) * this.maxNitrogen;
        let potassiumContent = (colour.s * 0.8 + colour.l * 0.1 + colour.h * 0.1) * this.maxPotassium;

        return {
            phosphorousContent,
            nitrogenContent,
            potassiumContent
        }
    }

    soilToColour(soil: Soil): Phaser.Display.Color {
        const hue = (54 / 240) * (1 - soil.phosphorousContent / this.maxPhosphorous);
        const luminosity = (1 - soil.nitrogenContent / this.maxNitrogen);
        const saturation = ((10 * soil.potassiumContent / this.maxPotassium) - luminosity - hue) / 8;

        return Phaser.Display.Color.HSLToColor(
            hue,
            saturation,
            luminosity
        );
    }
}