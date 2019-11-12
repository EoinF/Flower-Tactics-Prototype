import { GameStateManager, GameStateDelta } from "../controllers/GameStateManager";
import { UIContainer } from "../widgets/UIContainer";
import { SeedController } from "../controllers/SeedController";
import { seedController } from "../game";
import { GameState } from "../objects/GameState";
import { COLOURS } from "../widgets/constants";
import { combineLatest } from "rxjs";
import { first } from "rxjs/operators";

const SEEDS_PER_ROW = 16;
const MAX_ROWS = 15;

export class SeedView {
    scene: Phaser.Scene;
    gameStateManager: GameStateManager;
    seedContainer: UIContainer;
    heldSeed: Phaser.GameObjects.Sprite | null;

    constructor(scene: Phaser.Scene, gameStateManager: GameStateManager, seedController: SeedController, offsetY: number) {
        this.gameStateManager = gameStateManager;
        this.scene = scene;

        this.seedContainer = new UIContainer(scene, 8, offsetY + 4, 16 + SEEDS_PER_ROW * 8, 24 * MAX_ROWS, "Bottom")
            .setBackground(COLOURS.withAlpha(COLOURS.GRAY, 0.1))
            .setBorder(1, COLOURS.withAlpha(COLOURS.BLACK, 0.3))
            .setInteractive()
            .setDepth(3)

        scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (this.seedContainer.hits(pointer.x, pointer.y)) {
                seedController.setMouseOverSeedContainer(true);
            } else {
                seedController.setMouseOverSeedContainer(false);
            }

            if (this.heldSeed != null) {
                seedController.dragSeed(this.heldSeed.getData("type"), pointer.x, pointer.y);
                this.heldSeed.setPosition(pointer.x, pointer.y);
            }
        });

        seedController.mouseOverSeedContainerObservable().subscribe((isHighlighted) => {
            if (isHighlighted) {
                this.seedContainer
                    .setBackground(COLOURS.withAlpha(COLOURS.PURPLE_300, 0.9))
                    .setBorder(1, COLOURS.withAlpha(COLOURS.BLACK, 0.8))
            } else {
                this.seedContainer
                    .setBackground(COLOURS.withAlpha(COLOURS.GRAY, 0.1))
                    .setBorder(1, COLOURS.withAlpha(COLOURS.BLACK, 0.3))
            }
        })

        seedController.pickUpSeedObservable()
            .subscribe(pickedUpSeed => {
                if (pickedUpSeed.origin == 'SEED_ORIGIN_INVENTORY') {
                    this.seedContainer.children[this.seedContainer.children.length - 1]
                        .destroy();
                    this.seedContainer.children = this.seedContainer.children.filter((c, index) => index != this.seedContainer.children.length - 1);
                }
                this.heldSeed = this.scene.add.sprite(pickedUpSeed.x, pickedUpSeed.y, 'seed2')
                    .setData("type", pickedUpSeed.type)
                    .setDepth(4)
                    .setInteractive();
                this.heldSeed
                    .on('pointerup', (pointer: Phaser.Input.Pointer) => {
                        const subscription = seedController.resetPickedUpSeedObservable().pipe(first()).subscribe(() => {
                            if (pickedUpSeed.origin == 'SEED_ORIGIN_INVENTORY') {
                                this.addNewSeed(pickedUpSeed.type);
                            }
                        });
                        seedController.dropSeed(pickedUpSeed.type, pointer.x, pointer.y);
                        subscription.unsubscribe();
                        this.heldSeed!.setVisible(false);
                        this.heldSeed!.destroy();
                        this.heldSeed = null;
                    });
            })

        combineLatest(gameStateManager.nextStateObservable(), gameStateManager.nextDeltaObservable())
            .subscribe(([nextState, nextDelta]) => {
                this.seedContainer.clear();
                this.addSeedGUI(nextState, nextDelta);
            });
    }

    addSeedGUI(gameState: GameState, gameStateDelta: GameStateDelta) {
        Object.keys(gameState.seedStatus)
            .map(key => gameState.seedStatus[key])
            .forEach((status) => {
                const amountAlreadyPlaced = gameStateDelta.placedSeeds[status.type].length;
                for (let i = 0; i < status.quantity - amountAlreadyPlaced; i++) {
                    this.addNewSeed(status.type);
                }
            });
    }

    addNewSeed(type: string) {
        const x = (this.seedContainer.children.length) % SEEDS_PER_ROW;
        const y = Math.floor((this.seedContainer.children.length) / SEEDS_PER_ROW);
        
        const seedSprite = this.scene.add.sprite((x * 8) + 4, this.seedContainer.height + ((y + 1) * -24) + 4, "seed2")
            .setOrigin(0, 0)
            .setInteractive({draggable: true})
            .setData("type", type);
        
        seedSprite.on('dragstart', () => {
            seedController.pickUpSeed(type, seedSprite.x, seedSprite.y, 'SEED_ORIGIN_INVENTORY');
        });

        this.seedContainer.addChild(seedSprite);
    }
}