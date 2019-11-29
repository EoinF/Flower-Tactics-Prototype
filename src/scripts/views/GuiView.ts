import { GuiController } from "../controllers/GuiController";
import { GameStateManager } from "../controllers/GameStateManager";
import { TextButton } from "../widgets/TextButton";
import { COLOURS } from "../widgets/constants";
import { SeedContainerView } from "./SeedContainerView";
import { SelectedTileController } from "../controllers/SelectedTileController";
import { SeedController } from "../controllers/SeedController";
import { SelectedTileView } from "./SelectedTileView";
import { FlowerSelectorView } from "./FlowerSelectorView";
import { FlowerSelectionController } from "../controllers/FlowerSelectionController";

export class GuiView {
    constructor(
        scene: Phaser.Scene,
        gameStateManager: GameStateManager,
        guiController: GuiController,
        selectedTileController: SelectedTileController,
        flowerSelectionController: FlowerSelectionController, 
        seedController: SeedController
    ) {
        const selectedTileView = new SelectedTileView(scene, gameStateManager, selectedTileController);

        const { height } = scene.game.canvas;
        const offsetY = height - selectedTileView.y;
        const seedView = new SeedContainerView(scene, gameStateManager, seedController, flowerSelectionController, offsetY);
        const flowerSelectorView = new FlowerSelectorView(scene, gameStateManager, seedController, flowerSelectionController, offsetY + seedView.height, seedView.width);

        const endTurnButton = new TextButton(scene, 10, 10, 98, 24, "End Turn", COLOURS.WHITE, COLOURS.LIGHT_GRAY, "Bottom", "Right")
            .setBorder(1, COLOURS.PURPLE_500)
            .onClick(() => guiController.endTurn());
    }
}