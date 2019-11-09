import { GameStateManager, GameStateDelta } from "../controllers/GameStateManager";
import { UIContainer } from "../widgets/UIContainer";
import { SeedController } from "../controllers/SeedController";
import { seedController } from "../game";
import { GameState } from "../objects/GameState";
import { COLOURS } from "../widgets/constants";
import { combineLatest } from "rxjs";

const SEEDS_PER_ROW = 16;
const MAX_ROWS = 15;

export class SeedView {
    scene: Phaser.Scene;
    gameStateManager: GameStateManager;
    seedContainer: UIContainer;
    savedPositionX: number;
    savedPositionY: number;

    constructor(scene: Phaser.Scene, gameStateManager: GameStateManager, seedController: SeedController, offsetY: number) {
        this.gameStateManager = gameStateManager;
        this.scene = scene;

        this.seedContainer = new UIContainer(scene, 8, offsetY + 4, 16 + SEEDS_PER_ROW * 8, 24 * MAX_ROWS, "Bottom")
            .setBackground(COLOURS.withAlpha(COLOURS.GRAY, 0.1))
            .setBorder(1, COLOURS.withAlpha(COLOURS.BLACK, 0.3))
            .setInteractive();

        scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (this.seedContainer.hits(pointer.x, pointer.y)) {
                seedController.setMouseOverSeedContainer(true);
            } else {
                seedController.setMouseOverSeedContainer(false);
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
        const x = (this.seedContainer.children.length - 1) % SEEDS_PER_ROW;
        const y = Math.floor((this.seedContainer.children.length - 1) / SEEDS_PER_ROW);
        
        const seedSprite = this.scene.add.sprite((x * 8) + 4, this.seedContainer.height + ((y + 1) * -24) + 4, "seed2")
            .setOrigin(0, 0)
            .setInteractive({draggable: true})
            .setData("type", type);
        
        seedSprite.on('dragstart', () => {
            seedController.dragSeed(type, seedSprite.x, seedSprite.y);
            this.savedPositionX = seedSprite.x;
            this.savedPositionY = seedSprite.y;
        });
        
        seedSprite.on('drag', (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
            seedController.dragSeed(type, dragX, dragY);
            seedSprite.setPosition(dragX, dragY);
        });

        seedSprite.on('dragend', (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
            seedController.dropSeed(type, seedSprite.x, seedSprite.y);
            seedSprite.setPosition(this.savedPositionX, this.savedPositionY);
        });

        this.seedContainer.addChild(seedSprite);
    }
}