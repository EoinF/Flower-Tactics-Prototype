import { GuiController } from "../controllers/GuiController";

export class GuiView {
    constructor(scene: Phaser.Scene, controller: GuiController) {
        const {
            width, height
        } = scene.game.canvas;
        console.log(width, height);
        const rectangle = scene.add.rectangle(width - 10, height - 10, 98, 24, 0xeeddff)
        rectangle.setInteractive().on('pointerup', () => {
            controller.nextTurn();
        });
        rectangle.setStrokeStyle(1, 0x4c00ff, 0.5);
        rectangle.setOrigin(1, 1);

        const buttonText = scene.add.text(width - 20, height - 15, "End Turn");
        buttonText.setTint(0x0);
        buttonText.setOrigin(1, 1);
    }
}