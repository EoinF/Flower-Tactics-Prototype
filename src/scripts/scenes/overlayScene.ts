import { guiController, gameStateController, mapController } from "../game";
import { TutorialRunner } from "../tutorial/TutorialRunner";
import { Tutorial1 } from "../tutorial/Tutorial1";
import { MessageQueueView } from "../views/MessageQueueView";

export default class OverlayScene extends Phaser.Scene {
    constructor() {
      super({ key: 'OverlayScene' });
    }
    
    create() {
		new MessageQueueView(this, guiController);

		guiController.messagePromptObservable().subscribe(messagePrompt => {
			if (messagePrompt == null) {
				this.scene.pause();
			} else {
				this.scene.resume();
			}
		});
    }
}
  