import { GameStateManager, GameStateDelta } from "../controllers/GameStateManager";
import { UIContainer } from "../widgets/UIContainer";
import { SeedController } from "../controllers/SeedController";
import { COLOURS } from "../widgets/constants";
import { combineLatest } from "rxjs";
import { map, distinctUntilChanged } from "rxjs/operators";
import { FlowerSelectionController } from "../controllers/FlowerSelectionController";

export class FlowerSelectorView {
    scene: Phaser.Scene;
    gameStateManager: GameStateManager;
    flowerSelector: UIContainer;
    flowerSelectLeft: Phaser.GameObjects.Image;
    flowerSelectRight: Phaser.GameObjects.Image;
    flowerText: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, 
        gameStateManager: GameStateManager, 
        seedController: SeedController, 
        flowerSelectionController: FlowerSelectionController, 
        offsetY: number, 
        width: number
    ) {
        this.gameStateManager = gameStateManager;
        this.scene = scene;

        this.flowerSelector = new UIContainer(scene, 8, offsetY + 8, width, "auto", "Bottom")
            .setBackground(COLOURS.withAlpha(COLOURS.GRAY, 0.1))
            .setBorder(1, COLOURS.withAlpha(COLOURS.BLACK, 0.3))
            .setInteractive()
            .setDepth(3);
        
        this.flowerSelectLeft = scene.add.image(0, 0, "gui-arrow-left");
        this.flowerSelectRight = scene.add.image(0, 0, "gui-arrow-left").setFlipX(true);
        this.flowerText = scene.add.text(0, 0, "Selected flower name",
            { fontFamily: 'Verdana, "Times New Roman", Tahoma, serif', fontStyle: 'bold' })
            .setColor(COLOURS.BLACK.rgba)
            .setOrigin(0.5, 0.5);

        this.flowerSelector.addChild(this.flowerSelectLeft, "Middle", "Left");
        this.flowerSelector.addChild(this.flowerText, "Middle", "Middle");
        this.flowerSelector.addChild(this.flowerSelectRight, "Middle", "Right");

        this.flowerSelectLeft.setInteractive().on('pointerup', () => {
            flowerSelectionController.selectPreviousFlower();
        });
        this.flowerSelectRight.setInteractive().on('pointerup', () => {
            flowerSelectionController.selectNextFlower();
        });

        flowerSelectionController.selectedFlowerObservable().subscribe(flowerType => {
            this.flowerText.setText(flowerType.name);
        })

        scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (this.flowerSelector.hits(pointer.x, pointer.y)) {
                seedController.setMouseOverFlowerSelector(true);
            } else {
                seedController.setMouseOverFlowerSelector(false);
            }
        });

        combineLatest(seedController.mouseOverSeedContainerObservable(), seedController.mouseOverFlowerSelectorObservable())
            .pipe(
                map(([o1, o2]) => o1 || o2), 
                distinctUntilChanged()
            ).subscribe((isHighlighted) => {
            if (isHighlighted) {
                this.flowerSelector
                    .setBackground(COLOURS.withAlpha(COLOURS.PURPLE_300, 0.9))
                    .setBorder(1, COLOURS.withAlpha(COLOURS.BLACK, 0.8))
                    .setAlpha(1);
            } else {
                this.flowerSelector
                    .setBackground(COLOURS.withAlpha(COLOURS.GRAY, 0.1))
                    .setBorder(1, COLOURS.withAlpha(COLOURS.BLACK, 0.3))
                    .setAlpha(0.5);
            }
        })
    }
}