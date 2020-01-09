import { UIContainer } from "../../widgets/generic/UIContainer";
import { GuiController } from "../../controllers/GuiController";
import { GameStateController } from "../../controllers/GameStateController";
import { COLOURS } from "../../constants";
import { EvolveSeedController } from "../../controllers/EvolveSeedController";
import { SeedInventoryView } from "./SeedInventoryView";
import { SeedStatsView } from "./SeedStatsView";
import { EvolveControlsView } from "./EvolveControlsView";
import { GameDeltaController } from "../../controllers/GameDeltaController";

export class EvolveSeedView {
    constructor(scene: Phaser.Scene,
        guiController: GuiController,
        gameStateController: GameStateController, gameDeltaController: GameDeltaController,
        evolveSeedController: EvolveSeedController
    ) {
        const canvas = scene.game.canvas;

        const mainContainer = new UIContainer(scene, 0, 0, canvas.width, canvas.height)
            .setBackground(COLOURS.withAlpha(COLOURS.GRAY, 0.7));

        // Left hand panel
        const seedInventoryView = new SeedInventoryView(scene, 16, 16, (canvas.width * 0.6) - 24, canvas.height - 32,
            gameStateController, gameDeltaController, evolveSeedController);

        // Top right panel
        const seedStatsView = new SeedStatsView(scene, 16, 16, (canvas.width * 0.4) - 16, (canvas.height * 0.4) - 20,
            gameStateController, evolveSeedController);

        // Bottom right panel
        const evolveControlsView = new EvolveControlsView(scene, 16, 16, (canvas.width * 0.4) - 16, (canvas.height * 0.6) - 20,
            gameStateController, evolveSeedController, guiController);
        
        mainContainer.addChild(seedInventoryView, "Top", "Left");
        mainContainer.addChild(seedStatsView, "Top", "Right");
        mainContainer.addChild(evolveControlsView, "Bottom", "Right");
    }
}