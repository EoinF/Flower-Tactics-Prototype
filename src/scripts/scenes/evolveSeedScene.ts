import { guiController, gameStateController, evolveSeedController, gameDeltaController } from "../game";
import { combineLatest } from "rxjs";
import { EvolveSeedView } from "../views/EvolveSeedView/EvolveSeedView";

export default class EvolveSeedScene extends Phaser.Scene {
    constructor() {
      super({ key: 'EvolveSeedScene' });
    }
    
    create() {
        this.scene.setVisible(false);
        this.scene.pause();
        new EvolveSeedView(this, guiController, gameStateController, gameDeltaController, evolveSeedController);

        evolveSeedController.setFlowerNames(
            (this.cache.text.get('flower-names') as string)
                .split('\n')
                .map(name => name.replace('\n', ''))
            );
        
        combineLatest(guiController.messagePromptObservable(), guiController.screenStateObservable())
            .subscribe(([messagePrompt, screenState]) => {
                if (messagePrompt != null || screenState != "Evolve") {
                    this.scene.pause();
                } else {
                    this.scene.resume();
                }
                if (screenState === "Evolve") {
                    this.scene.setVisible(true);
                    this.scene.resume();
                } else {
                    this.scene.setVisible(false);
                    this.scene.pause();
                }
        });
    }
}
  