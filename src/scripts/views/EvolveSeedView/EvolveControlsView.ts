import { BaseUIObject } from "../../widgets/generic/UIObject";
import { COLOURS } from "../../constants";
import { EvolveSeedController } from "../../controllers/EvolveSeedController";
import { GameStateManager } from "../../controllers/GameStateManager";
import { TextButton } from "../../widgets/generic/TextButton";
import { GuiController } from "../../controllers/GuiController";
import { TextLabel } from "../../widgets/generic/TextLabel";
import { tap, delay, debounceTime } from "rxjs/operators";

export class EvolveControlsView extends BaseUIObject {
    constructor(scene: Phaser.Scene, x: number, y: number,
        width: number, height: number,
        gameStateManager: GameStateManager, evolveSeedController: EvolveSeedController, guiController: GuiController
    ) {
        super(scene, x, y, width, height);
        this.container.setBackground(COLOURS.PURPLE_200)
            .setBorder(1, COLOURS.BLACK)
        
        const closeButton = new TextButton(scene, 8, 8, 72, 28, "Close", COLOURS.BLACK)
            .setBackground(COLOURS.WHITE, COLOURS.LIGHT_GRAY)
            .setBorder(1, COLOURS.BLACK)
            .onClick(() => {
                guiController.setScreenState("In Game");
            });
            
        const evolveButton = new TextButton(scene, 8, 8, 112, 32, "Evolve", COLOURS.WHITE)
            .setBackground(COLOURS.BLUE_100, COLOURS.BLUE_700)
            .setBorder(1, COLOURS.BLACK)
            .onClick(() => {
                guiController.clickEvolveButton();
            })
            .setVisible(false);

        const evolveStatusLabel = new TextLabel(scene, 16 + evolveButton.width, 8, "", COLOURS.BLACK, {isBold: true, fontSize: 18})
            .setVisible(false);

        this.container.addChild(closeButton, "Bottom", "Right");
        this.container.addChild(evolveButton, "Bottom", "Left");
        this.container.addChild(evolveStatusLabel, "Bottom");

        evolveSeedController.stagedSeedsObservable().subscribe((stagedSeeds) => {
            const amountStaged = Object.keys(stagedSeeds)
                .map(key => stagedSeeds[key])
                .reduce((previous, current) => {
                    return previous + current;
                }, 0);
            evolveButton.setVisible(amountStaged > 0);
        });

        evolveSeedController.evolveStatusObservable().pipe(
            tap(status => {
                evolveStatusLabel.setText(status);
                evolveStatusLabel.setVisible(true);
            }),
            debounceTime(5000)
        ).subscribe(status => {
            evolveStatusLabel.setVisible(false);
        });
    }
}