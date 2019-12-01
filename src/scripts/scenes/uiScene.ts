import { GuiView } from "../views/GuiView";
import { guiController, gameStateManager, selectedObjectController, seedController, flowerSelectionController } from "../game";

export default class UIScene extends Phaser.Scene {
    constructor() {
      super({ key: 'UIScene' })
    }
    
  create() {
    const guiView = new GuiView(this, gameStateManager, guiController, selectedObjectController, flowerSelectionController, seedController);
  }
}
  