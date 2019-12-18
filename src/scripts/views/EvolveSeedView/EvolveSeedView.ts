import { UIContainer } from "../../widgets/generic/UIContainer";
import { GuiController } from "../../controllers/GuiController";
import { GameStateManager } from "../../controllers/GameStateManager";
import { COLOURS } from "../../constants";
import { TextButton } from "../../widgets/generic/TextButton";
import { combineLatest } from "rxjs";
import { EvolveSeedController } from "../../controllers/EvolveSeedController";
import { SeedInventoryView } from "./SeedInventoryView";

export class EvolveSeedView {
    constructor(scene: Phaser.Scene, guiController: GuiController, gameStateManager: GameStateManager, evolveSeedController: EvolveSeedController) {
        const canvas = scene.game.canvas;

        const mainContainer = new UIContainer(scene, 0, 0, canvas.width, canvas.height)
            .setBackground(COLOURS.withAlpha(COLOURS.GRAY, 0.7));

        const seedInventory = new SeedInventoryView(scene, 16, 16, (canvas.width * 0.6) - 24, canvas.height - (16 * 2), gameStateManager, evolveSeedController);

        const evolveContainer = new UIContainer(scene, 16, 16, (canvas.width * 0.4) - 24, canvas.height - (16 * 2))
            .setBackground(COLOURS.PURPLE_200)
            .setBorder(1, COLOURS.BLACK)
        
        const closeButton = new TextButton(scene, 8, 8, 72, 28, "Close", COLOURS.WHITE)
            .setBackground(COLOURS.BLUE_100, COLOURS.BLUE_700)
            .setBorder(1, COLOURS.BLACK)
            .onClick(() => {
                guiController.setScreenState("In Game");
            });

        evolveContainer.addChild(closeButton, "Bottom", "Right");
        
        mainContainer.addChild(seedInventory, "Top", "Left");
        mainContainer.addChild(evolveContainer, "Top", "Right");
    }
}