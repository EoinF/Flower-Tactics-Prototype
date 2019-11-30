import { GuiView } from "../views/GuiView";
import { guiController, gameStateManager, selectedTileController, seedController, flowerSelectionController } from "../game";
import { FlowerInfoView } from "../views/FlowerInfoView";

export default class UIScene extends Phaser.Scene {
    constructor() {
      super({ key: 'UIScene' })
    }
    
  create() {
    const guiView = new GuiView(this, gameStateManager, guiController, selectedTileController, flowerSelectionController, seedController);
    const flowerInfoView = new FlowerInfoView(this, guiController);
  }
}
  