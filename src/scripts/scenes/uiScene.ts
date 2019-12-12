import { GuiView } from "../views/GuiView";
import { guiController, gameStateManager, selectedObjectController, seedController, flowerSelectionController } from "../game";
import { TutorialRunner } from "../tutorial/TutorialRunner";
import { Tutorial1 } from "../tutorial/Tutorial1";

export default class UIScene extends Phaser.Scene {
    constructor() {
      super({ key: 'UIScene' })
    }
    
  create() {
    const guiView = new GuiView(this, gameStateManager, guiController, selectedObjectController, flowerSelectionController, seedController);
    new TutorialRunner(guiController, gameStateManager)
      .runTutorial(new Tutorial1());
  }
}
  