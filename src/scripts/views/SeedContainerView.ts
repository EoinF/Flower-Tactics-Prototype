import { GameStateController } from "../controllers/GameStateController";
import { UIContainer } from "../widgets/generic/UIContainer";
import { GameState } from "../objects/GameState";
import { combineLatest, merge } from "rxjs";
import { first, map, withLatestFrom, flatMap, filter, take, mergeMap, mergeMapTo } from "rxjs/operators";
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
import { GameDeltaController } from "../controllers/GameDeltaController";
import { PlacedSeed } from "../controllers/GameActionController";
import { StringMap } from "../types";
import { getPlayerColour } from "../widgets/utils";

export class SeedContainerView {
    width: number;
    height: number;
    scene: Phaser.Scene;
    gameStateController: GameStateController;
    mainContainer: UIContainer;

    constructor(
        scene: Phaser.Scene,
        gameStateController: GameStateController,
        gameDeltaController: GameDeltaController,
        guiController: GuiController,
        heldObjectController: HeldObjectController,
        flowerSelectionController: FlowerSelectionController,
        x: number,
        y: number,
        width: number
    ) {
        this.gameStateController = gameStateController;
        this.scene = scene;

        this.mainContainer = new FlexUIContainer(scene, x, y, width, 32, "Bottom", "Right")
            .setDepth(3)
            .setBackground(COLOURS.PURPLE_100)
            .setBorder(1, COLOURS.BLACK)
            .setAlpha(0.9)
            .setInteractive();

        const seedSprite = this.scene.add.image(4, 0, "seed2");

        const seedAmountLabel = new TextLabel(this.scene, 8 + seedSprite.width, 0, 'x999');
        const seedProgressBar = new ProgressBar(scene, 12 + seedSprite.width + seedAmountLabel.width, 0, 0, 100, "auto", 16);

        this.mainContainer.addChild(seedSprite, "Middle");
        this.mainContainer.addChild(seedAmountLabel, "Middle");
        this.mainContainer.addChild(seedProgressBar, "Middle");
        
        const seedPlacementButton = new TextButton(scene, 8, 0,
            24, 24, "+",
            COLOURS.RED, COLOURS.PURPLE_100, COLOURS.LIGHT_YELLOW
        ).setBorder(1, COLOURS.BLACK)
            .onClick(() => {
                guiController.clickSeedPlacementButton();
            });
            
        const evolveButton = new TextButton(scene, 12 + seedPlacementButton.width, 0, 24, 24, "^", COLOURS.RED, COLOURS.PURPLE_100, COLOURS.LIGHT_YELLOW)
            .setBorder(1, COLOURS.BLACK)
            .onClick(() => {
                guiController.setScreenState("Evolve");
            });

        
        const eyeButton = new ImageButton(scene, 16 + seedPlacementButton.width + evolveButton.width, 0, "button-eye", 24, 24, COLOURS.PURPLE_100, COLOURS.LIGHT_YELLOW, COLOURS.RED, COLOURS.RED)
            .setBorder(1, COLOURS.BLACK)
            .onHover(() => {
                guiController.revealSeedsOfType();
            })
            .onLeave(() => {
                guiController.disableRevealSeedsOfType();
            });

        this.mainContainer.addChild(seedPlacementButton, "Middle", "Right");
        this.mainContainer.addChild(evolveButton, "Middle", "Right");
        this.mainContainer.addChild(eyeButton, "Middle", "Right");

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
            withLatestFrom(
                heldObjectController.heldSeedObservable(),
                flowerSelectionController.selectedFlowerTypeObservable()
            )
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

        flowerSelectionController.selectedFlowerTypeObservable().pipe(
            withLatestFrom(heldObjectController.heldSeedObservable()),
            filter(([_, heldSeed]) => heldSeed != null),
        ).subscribe(([selectedFlowerType]) => {
            heldObjectController.pickUpSeed({
                type: selectedFlowerType,
                tileIndex: null
            });
        })
        
        combineLatest(gameStateController.gameStateObservable(), gameDeltaController.gameDeltaObservable(), flowerSelectionController.selectedFlowerTypeObservable())
            .subscribe(([nextState, nextDelta, selectedFlowerType]) => {
                const selectedSeedStatus = nextState.seedStatus[selectedFlowerType];
                let amountAlreadyPlaced = 0;
                const placedSeedsMap = nextDelta.getIntermediateDelta<StringMap<PlacedSeed[]>>("placedSeeds");
                if (placedSeedsMap != null && selectedSeedStatus.type in placedSeedsMap) {
                    amountAlreadyPlaced = placedSeedsMap[selectedSeedStatus.type].reduce((total, placedSeed) => total + placedSeed.amount, 0);
                }
                const amount = selectedSeedStatus.quantity - amountAlreadyPlaced;
                seedAmountLabel.setText(`x${amount}`);
            });

        combineLatest(gameStateController.gameStateObservable(), flowerSelectionController.selectedFlowerTypeObservable())
            .subscribe(([nextState, selectedFlowerType]) => {
                seedProgressBar.setValue(nextState.seedStatus[selectedFlowerType].progress);
            })

        gameStateController.currentPlayerObservable().subscribe(playerId => {
            seedSprite.setTint(getPlayerColour(playerId).color);
        })
    }
}