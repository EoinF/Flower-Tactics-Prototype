import { GuiView } from "../views/GuiView";
import { GuiController } from "../controllers/GuiController";
import { gameStateManager } from "../game";

export default class UIScene extends Phaser.Scene {
    constructor() {
      super({ key: 'UIScene' })
    }
    
  create() {
    const guiController = new GuiController(gameStateManager);
    const guiView = new GuiView(this, guiController);
  }
}
  