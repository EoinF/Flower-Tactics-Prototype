import { GuiView } from "../views/GuiView";
import { guiController, gameStateManager, selectedTileController, seedController } from "../game";

export default class UIScene extends Phaser.Scene {
    constructor() {
      super({ key: 'UIScene' })
    }
    
  create() {
    const guiView = new GuiView(this, gameStateManager, guiController, selectedTileController, seedController);
  }
}
  