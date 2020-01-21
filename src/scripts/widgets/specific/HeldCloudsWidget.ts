import { COLOURS } from "../../constants";
import { PlacedCloudWidget } from "./PlacedCloudWidget";

export class HeldCloudsWidget extends PlacedCloudWidget {
    constructor(scene: Phaser.Scene, x: number, y: number,
        playerColour: Phaser.Display.Color,
        backgroundColour: Phaser.Display.Color = COLOURS.withAlpha(COLOURS.TURQUOISE, 0.4),
        borderColour: Phaser.Display.Color = COLOURS.withAlpha(COLOURS.BLACK, 0.3)
    ) {
        super(scene, x, y, playerColour);
        
        this.container
            .setBorder(1, borderColour)
            .setBackground(backgroundColour);
    }
}