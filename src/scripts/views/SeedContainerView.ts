import { GameStateManager, GameStateDelta } from "../controllers/GameStateManager";
import { UIContainer } from "../widgets/generic/UIContainer";
import { GameState } from "../objects/GameState";
import { combineLatest } from "rxjs";
import { first, map, withLatestFrom, flatMap, filter } from "rxjs/operators";
import { FlowerSelectionController } from "../controllers/FlowerSelectionController";
import { FlowerType } from "../objects/FlowerType";
import { ImageButton } from "../widgets/generic/ImageButton";
import { ProgressBar } from "../widgets/generic/ProgressBar";
import { COLOURS } from "../constants";
import { TextButton } from "../widgets/generic/TextButton";
import { TextLabel } from "../widgets/generic/TextLabel";
import { FlexUIContainer } from "../widgets/generic/FlexUIContainer";
import { GuiController } from "../controllers/GuiController";
import { HeldObjectController } from "../controllers/HeldObjectController";

export class SeedContainerView {
    width: number;
    height: number;
    scene: Phaser.Scene;
    gameStateManager: GameStateManager;
    mainContainer: UIContainer;
    infoButton: ImageButton;
    evolveButton: TextButton;

    constructor(
        scene: Phaser.Scene,
        gameStateManager: GameStateManager,
        guiController: GuiController,
        heldObjectController: HeldObjectController,
        flowerSelectionController: FlowerSelectionController,
        x: number,
        y: number,
        width: number
    ) {
        this.gameStateManager = gameStateManager;
        this.scene = scene;

        this.mainContainer = new FlexUIContainer(scene, x, y, width, 32, "Bottom", "Right")
            .setDepth(3)
            .setBackground(COLOURS.PURPLE_100)
            .setBorder(1, COLOURS.BLACK)
            .setAlpha(0.9)
            .setInteractive();

        const seedSprite = new ImageButton(this.scene, 4, 0,
            "seed2",
            "auto", "auto",
            COLOURS.TRANSPARENT, COLOURS.TRANSPARENT, COLOURS.WHITE, COLOURS.WHITE
        );

        const seedAmountLabel = new TextLabel(this.scene, 8 + seedSprite.width, 0, 'x999');
        const seedProgressBar = new ProgressBar(scene, 12 + seedSprite.width + seedAmountLabel.width, 0, 0, 100, "auto", 16);

        this.mainContainer.addChild(seedSprite, "Middle");
        this.mainContainer.addChild(seedAmountLabel, "Middle");
        this.mainContainer.addChild(seedProgressBar, "Middle");
        
        this.infoButton = new ImageButton(scene, 4, 0, 'button-info', "auto", "auto", COLOURS.PURPLE_100, COLOURS.LIGHT_YELLOW, COLOURS.RED, COLOURS.RED)
            .setBorder(1, COLOURS.BLACK)
            .onClick(() => {
                guiController.clickInfoButton();
            });

        this.evolveButton = new TextButton(scene, 8 + this.infoButton.width, 0, 24, 24, "^", COLOURS.RED, COLOURS.PURPLE_100, COLOURS.LIGHT_YELLOW)
            .setBorder(1, COLOURS.BLACK)
            .onClick(() => {
                guiController.setScreenState("Evolve");
            });
        
        const seedPlacementButton = new TextButton(scene, 12 + this.infoButton.width + this.evolveButton.width, 0,
            24, 24, "+",
            COLOURS.RED, COLOURS.PURPLE_100, COLOURS.LIGHT_YELLOW
        ).setBorder(1, COLOURS.BLACK)
            .onClick(() => {
                guiController.clickSeedPlacementButton();
            });

        this.mainContainer.addChild(this.infoButton, "Middle", "Right");
        this.mainContainer.addChild(this.evolveButton, "Middle", "Right");
        this.mainContainer.addChild(seedPlacementButton, "Middle", "Right");

        this.width = this.mainContainer.width;
        this.height = this.mainContainer.height;

        scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (this.mainContainer.hits(pointer.x, pointer.y)) {
                guiController.setMouseOverSeedContainer(true);
            } else {
                guiController.setMouseOverSeedContainer(false);
            }
        });

        guiController.onClickSeedPlacementButtonObservable().pipe(
            withLatestFrom(heldObjectController.heldSeedObservable(), flowerSelectionController.selectedFlowerTypeObservable())
        ).subscribe(([_, heldSeed, selectedFlowerType]) => {
            if (heldSeed != null) {
                heldObjectController.dropObject();
            } else {
                heldObjectController.pickUpSeed({
                    type: selectedFlowerType, 
                    tileIndex: null
                });
            }
        })

        combineLatest(gameStateManager.nextStateObservable(), gameStateManager.nextDeltaObservable(), heldObjectController.heldSeedObservable())
            .pipe(
                filter(([_,__, heldSeed]) => heldSeed != null)
            ).subscribe(([state, delta, heldSeed]) => {
                let placedSeeds = 0;
                delta.placedSeeds[heldSeed!.type].forEach(amount => {
                    placedSeeds += amount;
                });
                if (state.seedStatus[heldSeed!.type].quantity <= placedSeeds) {
                    heldObjectController.dropObject();
                }
            })
        
        combineLatest(gameStateManager.nextStateObservable(), gameStateManager.nextDeltaObservable(), flowerSelectionController.selectedFlowerTypeObservable())
            .subscribe(([nextState, nextDelta, selectedFlowerType]) => {
                const selectedSeedStatus = nextState.seedStatus[selectedFlowerType];
                let amountAlreadyPlaced = 0;
                if (selectedSeedStatus.type in nextDelta.placedSeeds) {
                    const valuesIterator = nextDelta.placedSeeds[selectedSeedStatus.type].values();
                    let value = valuesIterator.next();
                    while (!value.done) {
                        amountAlreadyPlaced += value.value;
                        value = valuesIterator.next();
                    }
                }
                const amount = selectedSeedStatus.quantity - amountAlreadyPlaced;
                seedAmountLabel.setText(`x${amount}`);
            });

        combineLatest(gameStateManager.nextStateObservable(), flowerSelectionController.selectedFlowerTypeObservable())
            .subscribe(([nextState, selectedFlowerType]) => {
                seedProgressBar.setValue(nextState.seedStatus[selectedFlowerType].progress);
            })
    }
}