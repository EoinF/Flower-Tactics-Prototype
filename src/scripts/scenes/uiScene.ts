import { guiController, gameStateController, selectedObjectController, flowerSelectionController, heldObjectController, mapController, gameDeltaController } from "../game";
import { SelectedTileView } from "../views/SelectedTileView/SelectedTileView";
import { AlertMessageView } from "../views/AlertMessageView";
import { COLOURS } from "../constants";
import { TextButton } from "../widgets/generic/TextButton";
import { FlowerSelectionView } from "../views/FlowerSelectionView";
import { SeedContainerView } from "../views/SeedContainerView";
import { combineLatest } from "rxjs";
import { HeldObjectView } from "../views/HeldObjectView";
import { CloudUIView } from "../views/CloudUIView";
import { TextLabel } from "../widgets/generic/TextLabel";
import { UIContainer } from "../widgets/generic/UIContainer";
import { FlexUIContainer } from "../widgets/generic/FlexUIContainer";
import { EndTurnView } from "../views/EndTurnView";

export default class UIScene extends Phaser.Scene {
    constructor() {
      super({ key: 'UIScene' })
    }
    
  create() {
	guiController.setInputManager(this.input.keyboard.createCursorKeys());

	new SelectedTileView(this, gameStateController, selectedObjectController, mapController, heldObjectController);
	
	const flowerSelectionWidth = 300;

	const endTurnView = new EndTurnView(this, guiController, gameStateController);
	const offsetX = endTurnView.offsetX;

	const seedView = new SeedContainerView(this, gameStateController, gameDeltaController, guiController, heldObjectController, flowerSelectionController, offsetX, 8, flowerSelectionWidth);
	const flowerSelectionView = new FlowerSelectionView(this, gameStateController, guiController, flowerSelectionController, offsetX, 12 + seedView.height, flowerSelectionWidth);
	new CloudUIView(this, heldObjectController, guiController, gameStateController, offsetX, 16 + seedView.height + flowerSelectionView.flowerSelector.height);

	new AlertMessageView(this, guiController);

	new HeldObjectView(this, heldObjectController, guiController, mapController);
	
	combineLatest(guiController.messagePromptObservable(), guiController.screenStateObservable())
		.subscribe(([messagePrompt, screenState]) => {
			if (screenState === 'Main Menu') {
				this.scene.setVisible(false);
				this.scene.pause();
			} else {
				this.scene.setVisible(true);
				if (messagePrompt != null || screenState != "In Game") {
					this.scene.pause();
				} else {
					this.scene.resume();
				}
			}
	});
  }
}
  