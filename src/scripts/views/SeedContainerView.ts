import { GameStateManager, GameStateDelta } from "../controllers/GameStateManager";
import { UIContainer } from "../widgets/generic/UIContainer";
import { SeedController } from "../controllers/SeedController";
import { seedController, guiController, selectedObjectController } from "../game";
import { GameState } from "../objects/GameState";
import { combineLatest } from "rxjs";
import { first, map } from "rxjs/operators";
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
    heldSeed: Phaser.GameObjects.Sprite | null;

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

            if (this.heldSeed != null) {
                seedController.dragSeed(this.heldSeed.getData("pickedUpSeed").type, pointer.x, pointer.y);
                this.heldSeed.setPosition(pointer.x, pointer.y);
            }
        });

        scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            if (this.heldSeed != null) {
                const seedType = this.heldSeed.getData("pickedUpSeed").type;
                const seedOrigin = this.heldSeed.getData("pickedUpSeed").origin;
                const subscription = seedController.resetPickedUpSeedObservable().pipe(first()).subscribe(() => {
                    if (seedOrigin == 'SEED_ORIGIN_INVENTORY') {
                        this.addNewSeed(seedType);
                    }
                });
                seedController.dropSeed(seedType, pointer.x, pointer.y);
                subscription.unsubscribe();
                this.heldSeed!.setVisible(false);
                this.heldSeed!.destroy();
                this.heldSeed = null;
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

        seedController.pickUpSeedObservable()
            .subscribe(pickedUpSeed => {
                if (pickedUpSeed.origin == 'SEED_ORIGIN_INVENTORY') {
                    this.seedContainer.children[this.seedContainer.children.length - 1]
                        .destroy();
                    this.seedContainer.children = this.seedContainer.children.filter((c, index) => index != this.seedContainer.children.length - 1);
                }
                this.heldSeed = this.scene.add.sprite(scene.input.activePointer.x, scene.input.activePointer.y, 'seed2')
                    .setData("pickedUpSeed", pickedUpSeed)
                    .setDepth(5)
                    .setInteractive();
              });

        combineLatest(gameStateManager.nextStateObservable(), gameStateManager.nextDeltaObservable(), flowerSelectionController.selectedFlowerTypeObservable())
            .subscribe(([nextState, nextDelta, selectedFlowerType]) => {
                this.seedContainer.clear();
                this.addSeedGUI(nextState, nextDelta, selectedFlowerType);
            });

        combineLatest(gameStateManager.nextStateObservable(), flowerSelectionController.selectedFlowerTypeObservable())
            .subscribe(([nextDelta, selectedFlowerType]) => {
                seedProgressBar.setValue(nextDelta.seedStatus[selectedFlowerType.type].progress);
            })
    }

    addSeedGUI(gameState: GameState, gameStateDelta: GameStateDelta, selectedFlowerType: FlowerType) {
        const selectedSeedStatus = gameState.seedStatus[
            Object.keys(gameState.seedStatus)
                .find(type => selectedFlowerType.type === type)!
        ];

        let amountAlreadyPlaced = 0;
        const valuesIterator = gameStateDelta.placedSeeds[selectedSeedStatus.type].values();
        let value = valuesIterator.next();
        while (!value.done) {
            amountAlreadyPlaced += value.value;
            value = valuesIterator.next();
        }
        for (let i = 0; i < selectedSeedStatus.quantity - amountAlreadyPlaced; i++) {
            this.addNewSeed(selectedSeedStatus.type);
        }
    }

    addNewSeed(type: string) {
        const x = (this.seedContainer.children.length) % SEEDS_PER_ROW;
        const y = Math.floor((this.seedContainer.children.length) / SEEDS_PER_ROW);
        
        const seedSprite = this.scene.add.sprite((x * 8) + 4, this.seedContainer.height + ((y + 1) * -24) + 4, "seed2")
            .setOrigin(0, 0)
            .setInteractive({draggable: true})
            .setData("type", type);
        
        seedSprite.on('dragstart', (pointer: Phaser.Input.Pointer) => {
            seedController.pickUpSeed(type, null, 'SEED_ORIGIN_INVENTORY');
        });

        this.seedContainer.addChild(seedSprite);
    }
}