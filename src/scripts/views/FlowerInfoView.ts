import { UIContainer } from "../widgets/UIContainer";
import { COLOURS } from "../widgets/constants";
import { TextLabel } from "../widgets/TextLabel";
import { GuiController } from "../controllers/GuiController";


export class FlowerInfoView {
    infoTextContainer: UIContainer;

    constructor(
        scene: Phaser.Scene,
        guiController: GuiController,
    ) {

        this.infoTextContainer = new UIContainer(scene, 0, 0, 128, 128)
            .setBackground(COLOURS.PURPLE_100)
            .setBorder(1, COLOURS.BLACK)
            .setAlpha(0.8)
            .setVisible(false);

        const infoText = new TextLabel(scene, 4, 4, "", COLOURS.BLACK, true);
        this.infoTextContainer.addChild(infoText)
            .setDepth(20);

        guiController.mouseOverInfoButtonObservable().subscribe((isMouseOver: boolean) => {
            if (isMouseOver) {
                this.infoTextContainer.setPosition(scene.input.mousePointer.x, scene.input.mousePointer.y - this.infoTextContainer.height);
                this.infoTextContainer.setVisible(true);
                infoText.setText("test");
            } else {
                this.infoTextContainer.setVisible(false);
            }
        });
    }
}