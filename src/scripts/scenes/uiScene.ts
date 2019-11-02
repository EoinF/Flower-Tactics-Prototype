import { GuiView } from "../views/GuiView";
import { guiController, gameStateManager, selectedTileController } from "../game";
import { SelectedTileView } from "../views/SelectedTileView";

export default class UIScene extends Phaser.Scene {
    constructor() {
      super({ key: 'UIScene' })
    }
    
  create() {
    const guiView = new GuiView(this, gameStateManager, guiController);
    const selectedTileView = new SelectedTileView(this, gameStateManager, selectedTileController);
  }
}
  