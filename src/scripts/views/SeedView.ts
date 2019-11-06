import { GameStateManager } from "../GameStateManager";
import { UIContainer } from "../widgets/UIContainer";
import { SeedController } from "../controllers/SeedController";

const SEEDS_PER_ROW = 8;

export class SeedView {
    scene: Phaser.Scene;
    gameStateManager: GameStateManager;
    seedContainer: UIContainer;
    selectedSeed: Phaser.GameObjects.Sprite | null;
    savedPositionX: number;
    savedPositionY: number;

    constructor(scene: Phaser.Scene, gameStateManager: GameStateManager, seedController: SeedController, offsetY: number) {
        this.gameStateManager = gameStateManager;
        this.scene = scene;

        this.seedContainer = new UIContainer(scene, 8, offsetY + 4, 108, 24, "Bottom");

        gameStateManager.onChange(() => {
            this.seedContainer.clear();
            this.addSeedGUI();
        });
        this.addSeedGUI();

        // scene.input.on('pointermove', (pointer) => {
        //     console.log(scene.input.pointer1.x, scene.input.pointer1.y);
        //     if (this.selectedSeed != null) {
        //         this.selectedSeed.setPosition(scene.input.pointer1.x, scene.input.pointer1.y);
        //     }
        // })
    }

    addSeedGUI() {
        Object.keys(this.gameStateManager.gameState.seedStatus)
        .map(key => this.gameStateManager.gameState.seedStatus[key])
        .forEach(status => {
            for (let i = 0; i < status.quantity; i++) {
                this.addNewSeed(status.type);
            }
        });
    }

    addNewSeed(type: string) {
        const x = (this.seedContainer.children.length - 1) % SEEDS_PER_ROW;
        const y = Math.floor((this.seedContainer.children.length - 1) / SEEDS_PER_ROW);
        
        const seedSprite = this.scene.add.sprite((x * 16) + 4, (y * -24) + 4, "seed2")
            .setOrigin(0, 0)
            .setInteractive({draggable: true});
        
        seedSprite.on('dragstart', () => {
            this.savedPositionX = seedSprite.x;
            this.savedPositionY = seedSprite.y;
        });
        
        seedSprite.on('drag', (pointer, dragX, dragY) => { 
            seedSprite.setPosition(dragX, dragY);
         });
        seedSprite.on('dragend', () => {
            seedSprite.setPosition(this.savedPositionX, this.savedPositionY);
        });

        this.seedContainer.addChild(seedSprite);
    }
}