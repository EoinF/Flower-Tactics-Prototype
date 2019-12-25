import { BaseUIObject } from "../../widgets/generic/UIObject";
import { COLOURS, SEED_INTERVALS } from "../../constants";
import { EvolveSeedController } from "../../controllers/EvolveSeedController";
import { GameStateManager } from "../../controllers/GameStateManager";
import { TextButton } from "../../widgets/generic/TextButton";
import { GuiController } from "../../controllers/GuiController";
import { TextLabel } from "../../widgets/generic/TextLabel";
import { tap, debounceTime, filter } from "rxjs/operators";
import { combineLatest } from "rxjs";
import { EvolveChanceView } from "./EvolveChanceView";

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

        const title = new TextLabel(scene, 0, 8, "Seed Evolution", COLOURS.BLACK, { isBold: true, fontSize: 18 });
        
        this.container.addChild(title, "Top", "Middle");

        const evolveChanceView = new EvolveChanceView(scene, 16, title.height + 24, this.container.width - 32, evolveSeedController);

        this.container.addChild(evolveChanceView);
        this.container.addChild(closeButton, "Bottom", "Right");
        this.container.addChild(evolveButton, "Bottom", "Left");
        this.container.addChild(evolveStatusLabel, "Bottom");

        evolveSeedController.stagedSeedsObservable().subscribe((stagedSeed) => {
            evolveButton.setVisible(stagedSeed != null);
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

        combineLatest(gameStateManager.nextStateObservable(), evolveSeedController.stagedSeedsObservable())
            .pipe(
                filter(([gameState, stagedSeed]) => {
                    return stagedSeed != null &&
                        gameState.seedStatus[stagedSeed.type].quantity < SEED_INTERVALS[stagedSeed.stagedAmount]
                })
            )
            .subscribe(() => {
                evolveSeedController.unstageAllSeeds();
            });
    }
}
