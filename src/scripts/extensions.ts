 export interface HSLColor {
     h: number;
     s: number;
     l: number;
 }
 
 /**
    * Converts an RGB color value to HSL (hue, saturation and lightness).
    * Conversion forumla from http://en.wikipedia.org/wiki/HSL_color_space.
    * Assumes RGB values are contained in the set [0, 255] and returns h, s and l in the set [0, 1].
    * Based on code by Michael Jackson (https://github.com/mjijackson)
    *
    * @method Phaser.Color.RGBtoHSL
    * @static
    * @param {number} r - The red color component, in the range 0 - 255.
    * @param {number} g - The green color component, in the range 0 - 255.
    * @param {number} b - The blue color component, in the range 0 - 255.
    * @param {object} [out] - An object into which 3 properties will be created, h, s and l. If not provided a new object will be created.
    * @return {object} An object with the hue, saturation and lightness values set in the h, s and l properties.
    */
   export function RGBtoHSL(r: number, g: number, b: number, out: HSLColor = {
    h: 0,
    s: 0,
    l: 0
}): HSLColor {
    r /= 255;
    g /= 255;
    b /= 255;

    var min = Math.min(r, g, b);
    var max = Math.max(r, g, b);

    // achromatic by default
    out.h = 0;
    out.s = 0;
    out.l = (max + min) / 2;

    if (max !== min)
    {
        var d = max - min;

        out.s = out.l > 0.5 ? d / (2 - max - min) : d / (max + min);

        if (max === r)
        {
            out.h = (g - b) / d + (g < b ? 6 : 0);
        }
        else if (max === g)
        {
            out.h = (b - r) / d + 2;
        }
        else if (max === b)
        {
            out.h = (r - g) / d + 4;
        }

        out.h /= 6;
    }

    return out;
};