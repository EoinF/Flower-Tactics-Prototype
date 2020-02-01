import { GuiController } from "../controllers/GuiController";
import { TextButton } from "../widgets/generic/TextButton";
import { COLOURS } from "../constants";
import { GameStateController } from "../controllers/GameStateController";

export class EndTurnView {
    offsetX: number;

    constructor(scene: Phaser.Scene, guiController: GuiController, gameStateController: GameStateController) {
        const endTurnButtonPadding = 10;
        
        const endTurnButton = new TextButton(scene, endTurnButtonPadding, 8, 98, 24, "End Turn", COLOURS.BLACK,
		    COLOURS.WHITE, COLOURS.LIGHT_GRAY, undefined, "Bottom", "Right"
        )
            .setBorder(1, COLOURS.PURPLE_500)
            .onClick(() => guiController.endTurn());

        this.offsetX = endTurnButton.width + endTurnButtonPadding * 2;

        gameStateController.gamePhaseObservable().subscribe((phase) => {
            if (phase === 'ACTION') {
                endTurnButton.setVisible(true);
            } else {
                endTurnButton.setVisible(false);
            }
        });
    }
}