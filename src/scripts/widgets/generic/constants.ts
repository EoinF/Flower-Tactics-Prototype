
export type VerticalAlignment = "Top" | "Bottom" | "Middle";
export type HorizontalAlignment = "Left" | "Right" | "Middle";

export const COLOURS = {
    BLACK: new Phaser.Display.Color(0, 0, 0),
    WHITE: new Phaser.Display.Color(255, 255, 255),
    LIGHT_GRAY: new Phaser.Display.Color(200, 200, 200),
    GRAY: new Phaser.Display.Color(128, 128, 128),
    DARK_GRAY: new Phaser.Display.Color(64, 64, 64),
    PINK: new Phaser.Display.Color(255, 120, 140),
    BLUE: new Phaser.Display.Color(0, 0, 128),

    PURPLE_100: new Phaser.Display.Color(220, 186, 255),
    PURPLE_200: new Phaser.Display.Color(197, 167, 229),
    PURPLE_300: new Phaser.Display.Color(175, 148, 204),
    PURPLE_400: new Phaser.Display.Color(153, 130, 178),
    PURPLE_500: new Phaser.Display.Color(131, 111, 153),
    PURPLE_600: new Phaser.Display.Color(109, 93, 127),
    PURPLE_700: new Phaser.Display.Color(87, 74, 102),
    PURPLE_800: new Phaser.Display.Color(65, 55, 76),
    PURPLE_900: new Phaser.Display.Color(43, 37, 51),

    GREEN: new Phaser.Display.Color(50, 200, 50),
    RED: new Phaser.Display.Color(255, 0, 0),
    LIGHT_RED: new Phaser.Display.Color(255, 50, 50),

    YELLOW: new Phaser.Display.Color(255, 242, 0),
    LIGHT_YELLOW: new Phaser.Display.Color(255, 255, 94),

    TRANSPARENT: new Phaser.Display.Color(255, 255, 255, 0),

    withAlpha: (colour: Phaser.Display.Color, alpha: number) => {
        return new Phaser.Display.Color(colour.red, colour.green, colour.blue, Math.floor(alpha * 255));
    }
};