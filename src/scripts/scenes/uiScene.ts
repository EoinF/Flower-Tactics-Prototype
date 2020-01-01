import { guiController, gameStateManager, selectedObjectController, flowerSelectionController, heldObjectController, mapController } from "../game";
import { SelectedTileView } from "../views/SelectedTileView/SelectedTileView";
import { SelectedFlowerTypeView } from "../views/SelectedFlowerTypeView";
import { AlertMessageView } from "../views/AlertMessageView";
import { COLOURS } from "../constants";
import { TextButton } from "../widgets/generic/TextButton";
import { FlowerSelectionView } from "../views/FlowerSelectionView";
import { SeedContainerView } from "../views/SeedContainerView";
import { combineLatest } from "rxjs";
import { HeldObjectView } from "../views/HeldObjectView";
import { CloudUIView } from "../views/CloudUIView";

export default class UIScene extends Phaser.Scene {
    constructor() {
      super({ key: 'UIScene' })
    }
    
  create() {
	const selectedTileView = new SelectedTileView(this, gameStateManager, selectedObjectController, mapController);
	
	const flowerSelectionWidth = 300;
	const endTurnButtonPadding = 10;

	const endTurnButton = new TextButton(this, endTurnButtonPadding, 8, 98, 24, "End Turn", COLOURS.BLACK,
		COLOURS.WHITE, COLOURS.LIGHT_GRAY, "Bottom", "Right"
	)
		.setBorder(1, COLOURS.PURPLE_500)
		.onClick(() => guiController.endTurn());

	const offsetX = endTurnButton.width + endTurnButtonPadding * 2

	const seedView = new SeedContainerView(this, gameStateManager, guiController, heldObjectController, flowerSelectionController, offsetX, 8, flowerSelectionWidth);
	const flowerSelectionView = new FlowerSelectionView(this, gameStateManager, guiController, flowerSelectionController, offsetX, 12 + seedView.height, flowerSelectionWidth);
	new CloudUIView(this, heldObjectController, guiController, offsetX, 16 + seedView.height + flowerSelectionView.flowerSelector.height);

	new SelectedFlowerTypeView(this, gameStateManager, selectedObjectController);
	new AlertMessageView(this, guiController);

	new HeldObjectView(this, heldObjectController, guiController, mapController);
	
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
  