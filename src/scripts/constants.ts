export const NITROGEN_VALUE_RANGE = { min: 0, max: 3000 };
export const PHOSPHOROUS_VALUE_RANGE = { min: 0, max: 3000 };
export const POTASSIUM_VALUE_RANGE = { min: 0, max: 3000 };

export const ALERT_MESSAGE_TIMEOUT = 2000;

export const COLOURS = {
    BLACK: new Phaser.Display.Color(0, 0, 0),
    WHITE: new Phaser.Display.Color(255, 255, 255),
    LIGHT_GRAY: new Phaser.Display.Color(200, 200, 200),
    GRAY: new Phaser.Display.Color(128, 128, 128),
    DARK_GRAY: new Phaser.Display.Color(64, 64, 64),
    PINK: new Phaser.Display.Color(255, 120, 140),
    BLUE: new Phaser.Display.Color(0, 0, 128),
    BROWN: new Phaser.Display.Color(120, 50, 50),

    PURPLE_100: new Phaser.Display.Color(220, 186, 255),
    PURPLE_200: new Phaser.Display.Color(197, 167, 229),
    PURPLE_300: new Phaser.Display.Color(175, 148, 204),
    PURPLE_400: new Phaser.Display.Color(153, 130, 178),
    PURPLE_500: new Phaser.Display.Color(131, 111, 153),
    PURPLE_600: new Phaser.Display.Color(109, 93, 127),
    PURPLE_700: new Phaser.Display.Color(87, 74, 102),
    PURPLE_800: new Phaser.Display.Color(65, 55, 76),
    PURPLE_900: new Phaser.Display.Color(43, 37, 51),

    BLUE_200: new Phaser.Display.Color(80, 80, 229),
    BLUE_500: new Phaser.Display.Color(50, 50, 200),
    BLUE_700: new Phaser.Display.Color(0, 0, 140),

    PINK_100: new Phaser.Display.Color(220, 24, 152),
    TURQUOISE: new Phaser.Display.Color(75, 231, 163),

    GREEN: new Phaser.Display.Color(50, 200, 50),
    LIGHT_GREEN: new Phaser.Display.Color(50, 255, 50),
    RED: new Phaser.Display.Color(255, 0, 0),
    LIGHT_RED: new Phaser.Display.Color(255, 50, 50),

    YELLOW: new Phaser.Display.Color(255, 242, 0),
    LIGHT_YELLOW: new Phaser.Display.Color(255, 255, 94),

    TRANSPARENT: new Phaser.Display.Color(255, 255, 255, 0),

    PLAYER_RED: new Phaser.Display.Color(180, 10, 10),
    PLAYER_BLUE: new Phaser.Display.Color(10, 10, 180),

    withAlpha: (colour: Phaser.Display.Color, alpha: number) => {
        return new Phaser.Display.Color(colour.red, colour.green, colour.blue, Math.floor(alpha * 255));
    }
};

export const SEED_INTERVALS =               [0, 5,  10, 20, 30, 50, 100,    200]; // Number of seeds

export const SUCCESS_INTERVALS =            [0, 50, 70, 80, 40, 0,  0,      0];  // % chance
export const SUCCESS_PLUS_INTERVALS =       [0, 0,  10, 30, 65, 80, 30,     0];  // % chance
export const SUCCESS_PLUS_2_INTERVALS =     [0, 0,   0,  0, 10, 50, 70,     80]; // % chance
export const SUCCESS_PLUS_3_INTERVALS =     [0, 0,   0,  0, 0,   0, 30,     60]; // % chance

export const ACTION_RESOLUTION_DURATION = 500;
export const APPLYING_DELTAS_DURATION = 50;