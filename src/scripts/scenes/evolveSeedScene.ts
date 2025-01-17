import { guiController, gameStateController, evolveSeedController } from "../game";
import { combineLatest } from "rxjs";
import { EvolveSeedView } from "../views/EvolveSeedView/EvolveSeedView";

export default class EvolveSeedScene extends Phaser.Scene {
    constructor() {
      super({ key: 'EvolveSeedScene' });
    }
    
    create() {
        this.scene.setVisible(false);
        this.scene.pause();
        new EvolveSeedView(this, guiController, gameStateController, evolveSeedController);

        evolveSeedController.setFlowerNames(
            (this.cache.text.get('flower-names') as string)
                .split('\n')
                .map(name => name.replace(/[\n|\r]/g, ''))
            );

        guiController.screenStateObservable().subscribe((screenState) => {
            if (screenState === 'Evolve') {
                evolveSeedController.unstageAllSeeds();
            }
        })
        
        combineLatest(
            guiController.messagePromptObservable(),
            guiController.screenStateObservable(),
            evolveSeedController.isEvolveChoiceShownObservable()
        ).subscribe(([messagePrompt, screenState, isEvolveChoiceShown]) => {
            if (screenState === 'Main Menu') {
                this.scene.setVisible(false);
                this.scene.pause();
            } else {
                if (messagePrompt != null || screenState !== "Evolve" || isEvolveChoiceShown) {
                    this.scene.pause();
                } else {
                    this.scene.resume();
                }
                if (screenState === "Evolve") {
                    this.scene.setVisible(true);
                } else {
                    this.scene.setVisible(false);
                }
            }
        });
    }
}
  