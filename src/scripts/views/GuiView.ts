import { GuiController } from "../controllers/GuiController";
import { GameStateManager } from "../controllers/GameStateManager";
import { TextButton } from "../widgets/generic/TextButton";
import { SeedContainerView } from "./SeedContainerView";
import { SelectedObjectController } from "../controllers/SelectedObjectController";
import { SeedController } from "../controllers/SeedController";
import { SelectedTileView } from "./SelectedTileView/SelectedTileView";
import { FlowerSelectionView } from "./FlowerSelectionView";
import { FlowerSelectionController } from "../controllers/FlowerSelectionController";
import { SelectedFlowerTypeView } from "./SelectedFlowerTypeView";
import { selectedObjectController } from "../game";
import { AlertMessageView } from "./AlertMessageView";
import { COLOURS } from "../constants";

export class GuiView {
    constructor(
        scene: Phaser.Scene,
        gameStateManager: GameStateManager,
        guiController: GuiController,
        SelectedObjectController: SelectedObjectController,
        flowerSelectionController: FlowerSelectionController, 
        seedController: SeedController
    ) {
        const selectedTileView = new SelectedTileView(scene, gameStateManager, SelectedObjectController);
        new SelectedFlowerTypeView(scene, gameStateManager, selectedObjectController);
        new AlertMessageView(scene, guiController);

        const { height } = scene.game.canvas;
        const offsetY = height - selectedTileView.y;
        const seedView = new SeedContainerView(scene, gameStateManager, seedController, flowerSelectionController, offsetY);
        const flowerSelectionView = new FlowerSelectionView(scene, gameStateManager, seedController, flowerSelectionController, offsetY + seedView.height, seedView.width);

        const endTurnButton = new TextButton(scene, 10, 10, 98, 24, "End Turn", COLOURS.WHITE, COLOURS.LIGHT_GRAY, "Bottom", "Right")
            .setBorder(1, COLOURS.PURPLE_500)
            .onClick(() => guiController.endTurn());
    }
}