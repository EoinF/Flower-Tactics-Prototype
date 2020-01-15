import { guiController, evolveSeedController } from "../game";
import { MessageQueueView } from "../views/MessageQueueView";
import { EvolveChoiceView } from "../views/EvolveSeedView/EvolveChoiceView";
import { combineLatest, merge } from "rxjs";
import { mapTo, startWith } from "rxjs/operators";

export default class OverlayScene extends Phaser.Scene {
    constructor() {
      super({ key: 'OverlayScene' });
    }
    
    create() {
		new MessageQueueView(this, guiController);
		new EvolveChoiceView(this, evolveSeedController);

		combineLatest(
			guiController.messagePromptObservable(),
			evolveSeedController.isEvolveChoiceShownObservable()
		).subscribe(([messagePrompt, isEvolveChoiceShown]) => {
			if (messagePrompt == null && !isEvolveChoiceShown) {
				this.scene.pause();
			} else {
				this.scene.resume();
			}
		});
    }
}
  