import { GameStateManager, GameStateDelta } from "../GameStateManager";
import { UIContainer } from "../widgets/UIContainer";
import { SeedController } from "../controllers/SeedController";
import { seedController } from "../game";
import { GameState } from "../GameState";
import { COLOURS } from "../widgets/constants";

const SEEDS_PER_ROW = 16;
const MAX_ROWS = 15;

export class SeedView {
    scene: Phaser.Scene;
    gameStateManager: GameStateManager;
    seedContainer: UIContainer;

    constructor(scene: Phaser.Scene, gameStateManager: GameStateManager, seedController: SeedController, offsetY: number) {
        this.gameStateManager = gameStateManager;
        this.scene = scene;

        this.seedContainer = new UIContainer(scene, 8, offsetY + 4, 16 + SEEDS_PER_ROW * 8, 24 * MAX_ROWS, "Bottom")
            .setBackground(COLOURS.withAlpha(COLOURS.LIGHT_GRAY, 0.1))
            .setBorder(1, COLOURS.withAlpha(COLOURS.BLACK, 0.3))
            .setInteractive();

        scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (this.seedContainer.hits(pointer.x, pointer.y)) {
                seedController.setMouseOverContainer(true);
            } else {
                seedController.setMouseOverContainer(false);
            }
        });

        seedController.onSetContainerHighlighted((isHighlighted) => {
            if (isHighlighted) {
                this.seedContainer
                    .setBackground(COLOURS.withAlpha(COLOURS.LIGHT_GRAY, 0.6))
                    .setBorder(1, COLOURS.withAlpha(COLOURS.LIGHT_GRAY, 0.8))
            } else {
                this.seedContainer
                    .setBackground(COLOURS.withAlpha(COLOURS.LIGHT_GRAY, 0.1))
                    .setBorder(1, COLOURS.withAlpha(COLOURS.BLACK, 0.3))
            }
        })

        seedController.onDropSeedOverContainer((spriteIndex: number, savedX: number, savedY: number) => {
            this.seedContainer.children[spriteIndex].setPosition(savedX, savedY);
        });

        gameStateManager.onNextState(() => {
            this.seedContainer.clear();
            this.addSeedGUI(this.gameStateManager.gameState, this.gameStateManager.gameStateDelta);
        });
        gameStateManager.onNextDelta(() => {
            this.seedContainer.clear();
            this.addSeedGUI(this.gameStateManager.gameState, this.gameStateManager.gameStateDelta);
        });
        this.addSeedGUI(this.gameStateManager.gameState, this.gameStateManager.gameStateDelta);
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
            .setInteractive({draggable: true});
        
        seedSprite.on('dragstart', () => {
            seedController.startDraggingSeed(this.seedContainer.children.indexOf(seedSprite), seedSprite.x, seedSprite.y);
        });
        
        seedSprite.on('drag', (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
            seedController.dragSeed(type, dragX, dragY);
            seedSprite.setPosition(dragX, dragY);
        });

        seedSprite.on('dragend', (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
            seedController.dropSeed(type, seedSprite.x, seedSprite.y);
        });
        

        this.seedContainer.addChild(seedSprite);
    }
}