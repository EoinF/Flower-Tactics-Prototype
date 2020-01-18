import { GameStateController } from "../controllers/GameStateController";
import { UIContainer } from "../widgets/generic/UIContainer";
import { withLatestFrom } from "rxjs/operators";
import { FlowerSelectionController } from "../controllers/FlowerSelectionController";
import { ImageButton } from "../widgets/generic/ImageButton";
import { TextLabel } from "../widgets/generic/TextLabel";
import { FlexUIContainer } from "../widgets/generic/FlexUIContainer";
import { COLOURS } from "../constants";
import { GuiController } from "../controllers/GuiController";
import { ContainerButton } from "../widgets/generic/ContainerButton";

export class FlowerSelectionView {
    scene: Phaser.Scene;
    gameStateController: GameStateController;
    flowerSelector: ContainerButton;
    flowerSelectLeft: ImageButton;
    flowerSelectRight: ImageButton;
    flowerText: TextLabel;

    constructor(scene: Phaser.Scene,
        gameStateController: GameStateController,
        guiController: GuiController,
        flowerSelectionController: FlowerSelectionController,
        x: number, y: number,
        width: number
    ) {
        this.gameStateController = gameStateController;
        this.scene = scene;
        
        this.flowerSelectLeft = new ImageButton(scene, 0, 0, "gui-arrow-left", "auto", "auto", COLOURS.TRANSPARENT, COLOURS.TRANSPARENT, COLOURS.WHITE, COLOURS.GRAY);
        this.flowerSelectRight = new ImageButton(scene, 0, 0, "gui-arrow-left", "auto", "auto", COLOURS.TRANSPARENT, COLOURS.TRANSPARENT, COLOURS.WHITE, COLOURS.GRAY);
        this.flowerSelectRight.image.setFlipX(true);
        this.flowerText = new TextLabel(scene, 0, 0, "Selected flower name", COLOURS.BLACK, {isBold: true})
            .setOrigin(0.5, 0.5);

        this.flowerSelector = new ContainerButton(scene, x, y, width, this.flowerSelectLeft.height, COLOURS.PURPLE_100, COLOURS.LIGHT_YELLOW, "Bottom", "Right")
            .setBorder(1, COLOURS.BLACK)
            .setAlpha(0.9)
            .setDepth(3);

        this.flowerSelector.addChild(this.flowerSelectLeft, "Middle", "Left");
        this.flowerSelector.addChild(this.flowerText, "Middle", "Middle");
        this.flowerSelector.addChild(this.flowerSelectRight, "Middle", "Right");

        this.flowerSelector.onClick(() => {
            guiController.clickInfoButton();
            guiController.setScreenState('Evolve');
        })

        this.flowerSelectLeft.onClick(() => {
            flowerSelectionController.selectPreviousFlower();
        });
        this.flowerSelectRight.onClick(() => {
            flowerSelectionController.selectNextFlower();
        });

        flowerSelectionController.selectedFlowerTypeObservable().pipe(
            withLatestFrom(gameStateController.gameStateObservable())
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