import { COLOURS } from "./constants";

export class RectangleSprite extends Phaser.GameObjects.Sprite {

    constructor(
        scene: Phaser.Scene, x: number, y: number,
        width: number, height: number, alpha: number = 1,
        strokeConfig: Phaser.Types.GameObjects.Graphics.LineStyle = {},
        fillConfig: Phaser.Types.GameObjects.Graphics.FillStyle = {},
    ) {
        const graphics = scene.add.graphics(
            {
              fillStyle: {
                color: COLOURS.WHITE.color,
                alpha,
                ...fillConfig
              },
              lineStyle: {
                  width: 1,
                  color: COLOURS.BLACK.color,
                  alpha: 1,
                  ...strokeConfig
              }
            }
        );
    
        const rectanglePoints = [
            { x: 0, y: 0 },
            { x: width, y: 0 },
            { x: width, y: height},
            { x: 0, y: height }
        ]
        graphics.fillPoints(rectanglePoints, true);
        graphics.strokePoints(rectanglePoints, true);
        graphics.generateTexture('_temp_NumberRangeDisplay', width, height);
        graphics.destroy();
    
        super(scene, x, y, '_temp_NumberRangeDisplay');
        scene.add.existing(this);
    }
}