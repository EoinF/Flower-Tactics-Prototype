import { GameStateManager } from "../controllers/GameStateManager";
import { UIContainer } from "../widgets/generic/UIContainer";
import { withLatestFrom } from "rxjs/operators";
import { FlowerSelectionController } from "../controllers/FlowerSelectionController";
import { ImageButton } from "../widgets/generic/ImageButton";
import { TextLabel } from "../widgets/generic/TextLabel";
import { FlexUIContainer } from "../widgets/generic/FlexUIContainer";
import { COLOURS } from "../constants";
import { GuiController } from "../controllers/GuiController";

export class FlowerSelectionView {
    scene: Phaser.Scene;
    gameStateManager: GameStateManager;
    flowerSelector: UIContainer;
    flowerSelectLeft: ImageButton;
    flowerSelectRight: ImageButton;
    flowerText: TextLabel;

    constructor(scene: Phaser.Scene,
        gameStateManager: GameStateManager,
        guiController: GuiController,
        flowerSelectionController: FlowerSelectionController,
        x: number, y: number,
        width: number
    ) {
        this.gameStateManager = gameStateManager;
        this.scene = scene;

        this.flowerSelector = new FlexUIContainer(scene, x, y, width, "auto", "Bottom", "Right")
            .setBackground(COLOURS.PURPLE_100)
            .setBorder(1, COLOURS.BLACK)
            .setAlpha(0.9)
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

        flowerSelectionController.selectedFlowerTypeObservable().pipe(
            withLatestFrom(gameStateManager.nextStateObservable())
        ).subscribe(([flowerType, gameState]) => {
            this.flowerText.setText(gameState.flowerTypes[flowerType].name);
        })

        scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (this.flowerSelector.hits(pointer.x, pointer.y)) {
                guiController.setMouseOverFlowerSelector(true);
            } else {
                guiController.setMouseOverFlowerSelector(false);
            }
        });
    }
}