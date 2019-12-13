import { GameStateManager, GameStateDelta } from "../controllers/GameStateManager";
import { UIContainer } from "../widgets/generic/UIContainer";
import { SeedController } from "../controllers/SeedController";
import { combineLatest } from "rxjs";
import { map, distinctUntilChanged } from "rxjs/operators";
import { FlowerSelectionController } from "../controllers/FlowerSelectionController";
import { ImageButton } from "../widgets/generic/ImageButton";
import { TextLabel } from "../widgets/generic/TextLabel";
import { FlexUIContainer } from "../widgets/generic/FlexUIContainer";
import { COLOURS } from "../constants";

export class FlowerSelectionView {
    scene: Phaser.Scene;
    gameStateManager: GameStateManager;
    flowerSelector: UIContainer;
    flowerSelectLeft: ImageButton;
    flowerSelectRight: ImageButton;
    flowerText: TextLabel;

    constructor(scene: Phaser.Scene, 
        gameStateManager: GameStateManager, 
        seedController: SeedController, 
        flowerSelectionController: FlowerSelectionController, 
        offsetY: number, 
        width: number
    ) {
        this.gameStateManager = gameStateManager;
        this.scene = scene;

        this.flowerSelector = new FlexUIContainer(scene, 8, offsetY + 8, width, "auto", "Bottom")
            .setBackground(COLOURS.withAlpha(COLOURS.GRAY, 0.1))
            .setBorder(1, COLOURS.withAlpha(COLOURS.BLACK, 0.3))
            .setInteractive()
            .setDepth(3);
        
        this.flowerSelectLeft = new ImageButton(scene, 0, 0, "gui-arrow-left", "auto", "auto", COLOURS.TRANSPARENT, COLOURS.TRANSPARENT, COLOURS.WHITE, COLOURS.GRAY);
        this.flowerSelectRight = new ImageButton(scene, 0, 0, "gui-arrow-left", "auto", "auto", COLOURS.TRANSPARENT, COLOURS.TRANSPARENT, COLOURS.WHITE, COLOURS.GRAY);
        this.flowerSelectRight.image.setFlipX(true);
        this.flowerText = new TextLabel(scene, 0, 0, "Selected flower name", COLOURS.BLACK, {isBold: true})
            .setOrigin(0.5, 0.5);

        this.flowerSelector.addChild(this.flowerSelectLeft, "Middle", "Left");
        this.flowerSelector.addChild(this.flowerText, "Middle", "Middle");
        this.flowerSelector.addChild(this.flowerSelectRight, "Middle", "Right");

        this.flowerSelectLeft.onClick(() => {
            flowerSelectionController.selectPreviousFlower();
        });
        this.flowerSelectRight.onClick(() => {
            flowerSelectionController.selectNextFlower();
        });

        flowerSelectionController.selectedFlowerTypeObservable().subscribe(flowerType => {
            this.flowerText.setText(flowerType.name);
        })

        scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (this.flowerSelector.hits(pointer.x, pointer.y)) {
                seedController.setMouseOverFlowerSelector(true);
            } else {
                seedController.setMouseOverFlowerSelector(false);
            }
        });

        combineLatest(seedController.mouseOverSeedContainerObservable(), seedController.mouseOverFlowerSelectionObservable())
            .pipe(
                map(([o1, o2]) => o1 || o2),
                distinctUntilChanged()
            ).subscribe((isHighlighted) => {
            if (isHighlighted) {
                this.flowerSelector
                    .setBackground(COLOURS.withAlpha(COLOURS.PURPLE_100, 0.9))
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