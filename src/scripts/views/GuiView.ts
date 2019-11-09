import { GuiController } from "../controllers/GuiController";
import { GameStateManager } from "../controllers/GameStateManager";
import { UIContainer } from "../widgets/UIContainer";
import { TextButton } from "../widgets/TextButton";
import { COLOURS } from "../widgets/constants";
import { SeedView } from "./SeedView";
import { SelectedTileController } from "../controllers/SelectedTileController";
import { seedController } from "../game";
import { SeedController } from "../controllers/SeedController";
import { SelectedTileView } from "./SelectedTileView";

export class GuiView {
    constructor(
        scene: Phaser.Scene,
        gameStateManager: GameStateManager,
        guiController: GuiController,
        selectedTileController: SelectedTileController,
        seedController: SeedController
    ) {
        const selectedTileView = new SelectedTileView(scene, gameStateManager, selectedTileController);

        const { height } = scene.game.canvas;
        const offsetY = height - selectedTileView.y;
        const seedView = new SeedView(scene, gameStateManager, seedController, offsetY);

        const endTurnButton = new TextButton(scene, 10, 10, 98, 24, "End Turn", COLOURS.WHITE, COLOURS.LIGHT_GRAY, "Bottom", "Right")
            .setBorder(1, COLOURS.PURPLE_500)
            .onClick(() => guiController.endTurn());
    }
}