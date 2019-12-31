import { GameStateManager, GameStateDelta } from "../controllers/GameStateManager";
import { UIContainer } from "../widgets/generic/UIContainer";
import { SeedController } from "../controllers/SeedController";
import { seedController, guiController, selectedObjectController, heldObjectController } from "../game";
import { GameState } from "../objects/GameState";
import { combineLatest } from "rxjs";
import { first, map, withLatestFrom, flatMap, filter } from "rxjs/operators";
import { FlowerSelectionController } from "../controllers/FlowerSelectionController";
import { FlowerType } from "../objects/FlowerType";
import { ImageButton } from "../widgets/generic/ImageButton";
import { ProgressBar } from "../widgets/generic/ProgressBar";
import { COLOURS } from "../constants";
import { TextButton } from "../widgets/generic/TextButton";

const SEEDS_PER_ROW = 24;
const MAX_ROWS = 2;

export class SeedContainerView {
    width: number;
    height: number;
    scene: Phaser.Scene;
    gameStateManager: GameStateManager;
    mainContainer: UIContainer;
    seedContainer: UIContainer;
    infoButton: ImageButton;
    evolveButton: TextButton;

    constructor(
        scene: Phaser.Scene,
        gameStateManager: GameStateManager,
        seedController: SeedController,
        flowerSelectionController: FlowerSelectionController, 
        offsetY: number
    ) {
        this.gameStateManager = gameStateManager;
        this.scene = scene;
        
        const seedProgressBar = new ProgressBar(scene, 4, 6, 0, 100);

        this.mainContainer = new UIContainer(scene, 8, offsetY + 4, seedProgressBar.width + 64 + SEEDS_PER_ROW * 8, 24 * MAX_ROWS, "Bottom")
            .setDepth(3)
            .setInteractive();

        this.seedContainer = new UIContainer(scene, 0, 0, seedProgressBar.width + 64 + SEEDS_PER_ROW * 8, 24 * MAX_ROWS)
            .setInteractive();
        
        this.infoButton = new ImageButton(scene, 4, 4, 'button-info', "auto", "auto", COLOURS.PURPLE_100, COLOURS.LIGHT_YELLOW, COLOURS.RED, COLOURS.RED)
            .setBorder(1, COLOURS.BLACK)
            .onClick(() => {
                guiController.clickInfoButton();
            });

        this.evolveButton = new TextButton(scene, 8 + this.infoButton.width, 4, 24, 24, "+", COLOURS.RED, COLOURS.PURPLE_100, COLOURS.LIGHT_YELLOW)
            .setBorder(1, COLOURS.BLACK)
            .onClick(() => {
                guiController.setScreenState("Evolve");
            });        

        this.mainContainer.addChild(this.seedContainer);
        this.mainContainer.addChild(
            this.infoButton,
            "Top", "Right"
        );
        this.mainContainer.addChild(
            this.evolveButton,
            "Top", "Right"
        );
        this.mainContainer.addChild(
            seedProgressBar,
            "Bottom", "Right"
        );

        this.width = this.mainContainer.width;
        this.height = this.mainContainer.height;

        scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (this.seedContainer.hits(pointer.x, pointer.y)) {
                seedController.setMouseOverSeedContainer(true);
            } else {
                seedController.setMouseOverSeedContainer(false);
            }
        });

        combineLatest(seedController.mouseOverSeedContainerObservable(), seedController.mouseOverFlowerSelectionObservable())
            .pipe(map(([o1, o2]) => o1 || o2))
            .subscribe((isHighlighted) => {
            if (isHighlighted) {
                this.mainContainer
                    .setBackground(COLOURS.PURPLE_100)
                    .setBorder(1, COLOURS.BLACK)
                    .setAlpha(0.9);
            } else {
                this.mainContainer
                    .setBackground(COLOURS.PURPLE_300)
                    .setBorder(1, COLOURS.BLACK)
                    .setAlpha(0.7);
            }
        })

        guiController.onClickSeedPlacementButtonObservable().pipe(
            withLatestFrom(heldObjectController.heldSeedObservable(), flowerSelectionController.selectedFlowerTypeObservable())
        ).subscribe(([_, heldSeed, selectedFlowerType]) => {
            if (heldSeed != null) {
                heldObjectController.dropObject();
            } else {
                heldObjectController.pickUpSeed({
                    type: selectedFlowerType, 
                    tileIndex: null,
                    origin: 'SEED_ORIGIN_INVENTORY'
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
        

        // heldObjectController.heldSeedObservable()
        //     .subscribe(pickedUpSeed => {
        //         if (pickedUpSeed != null) {
        //             if (pickedUpSeed.origin == 'SEED_ORIGIN_INVENTORY') {
        //                 this.seedContainer.children[this.seedContainer.children.length - 1]
        //                     .destroy();
        //                 this.seedContainer.children = this.seedContainer.children.filter((c, index) => index != this.seedContainer.children.length - 1);
        //             }
        //         }
        //       });

        combineLatest(gameStateManager.nextStateObservable(), gameStateManager.nextDeltaObservable(), flowerSelectionController.selectedFlowerTypeObservable())
            .subscribe(([nextState, nextDelta, selectedFlowerType]) => {
                this.seedContainer.clear();
                this.addSeedGUI(nextState, nextDelta, nextState.flowerTypes[selectedFlowerType]);
            });

        combineLatest(gameStateManager.nextStateObservable(), flowerSelectionController.selectedFlowerTypeObservable())
            .subscribe(([nextState, selectedFlowerType]) => {
                seedProgressBar.setValue(nextState.seedStatus[selectedFlowerType].progress);
            })
    }

    addSeedGUI(gameState: GameState, gameStateDelta: GameStateDelta, selectedFlowerType: FlowerType) {
        const selectedSeedStatus = gameState.seedStatus[
            Object.keys(gameState.seedStatus)
                .find(type => selectedFlowerType.type === type)!
        ];

        let amountAlreadyPlaced = 0;
        if (selectedSeedStatus.type in gameStateDelta.placedSeeds) {
            const valuesIterator = gameStateDelta.placedSeeds[selectedSeedStatus.type].values();
            let value = valuesIterator.next();
            while (!value.done) {
                amountAlreadyPlaced += value.value;
                value = valuesIterator.next();
            }
        }
        for (let i = 0; i < selectedSeedStatus.quantity - amountAlreadyPlaced; i++) {
            this.addNewSeed(selectedSeedStatus.type);
        }
    }

    addNewSeed(type: string) {
        const x = (this.seedContainer.children.length) % SEEDS_PER_ROW;
        const y = Math.floor((this.seedContainer.children.length) / SEEDS_PER_ROW);
        
        const seedSprite = new ImageButton(this.scene, (x * 8) + 4, this.seedContainer.height + ((y + 1) * -24) + 4,
            "seed2", 
            "auto", "auto",
            COLOURS.TRANSPARENT, COLOURS.TRANSPARENT, COLOURS.WHITE, COLOURS.WHITE
        );
        
        seedSprite.onClick(() => {
            guiController.clickSeedPlacementButton();
        });

        this.seedContainer.addChild(seedSprite);
    }
}