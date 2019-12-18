import { guiController, gameStateManager, selectedObjectController, seedController, flowerSelectionController } from "../game";
import { SelectedTileView } from "../views/SelectedTileView/SelectedTileView";
import { SelectedFlowerTypeView } from "../views/SelectedFlowerTypeView";
import { AlertMessageView } from "../views/AlertMessageView";
import { COLOURS } from "../constants";
import { TextButton } from "../widgets/generic/TextButton";
import { FlowerSelectionView } from "../views/FlowerSelectionView";
import { SeedContainerView } from "../views/SeedContainerView";
import { combineLatest } from "rxjs";

export default class UIScene extends Phaser.Scene {
    constructor() {
      super({ key: 'UIScene' })
    }
    
  create() {
    const selectedTileView = new SelectedTileView(this, gameStateManager, selectedObjectController);
	new SelectedFlowerTypeView(this, gameStateManager, selectedObjectController);
	new AlertMessageView(this, guiController);

	const { height } = this.game.canvas;
	const offsetY = height - selectedTileView.y;
	const seedView = new SeedContainerView(this, gameStateManager, seedController, flowerSelectionController, offsetY);
	const flowerSelectionView = new FlowerSelectionView(this, gameStateManager, seedController, flowerSelectionController, offsetY + seedView.height, seedView.width);

	const endTurnButton = new TextButton(this, 10, 10, 98, 24, "End Turn", COLOURS.BLACK,
		COLOURS.WHITE, COLOURS.LIGHT_GRAY, "Bottom", "Right"
	)
		.setBorder(1, COLOURS.PURPLE_500)
		.onClick(() => guiController.endTurn());
	
	combineLatest(guiController.messagePromptObservable(), guiController.screenStateObservable())
		.subscribe(([messagePrompt, screenState]) => {
			if (messagePrompt != null || screenState != "In Game") {
				this.scene.pause();
			} else {
				this.scene.resume();
			}
	});
  }
}
  