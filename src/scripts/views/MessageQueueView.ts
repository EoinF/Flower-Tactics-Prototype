import { GuiController } from "../controllers/GuiController";
import { UIContainer } from "../widgets/generic/UIContainer";
import { COLOURS } from "../constants";
import { TextLabel } from "../widgets/generic/TextLabel";
import { TextButton } from "../widgets/generic/TextButton";
import { withLatestFrom } from "rxjs/operators";

export interface MessagePrompt {
    position: {x: number, y: number} | undefined;
    title: string;
    content: string;
}

export class MessageQueueView {
    constructor(scene: Phaser.Scene, guiController: GuiController) {
        const mainContainer = new UIContainer(scene, 0, 0, scene.game.canvas.width, scene.game.canvas.height)
            .setBackground(COLOURS.withAlpha(COLOURS.GRAY, 0.7));
        const popupContainer = new UIContainer(scene, 0, 0, 300, 200)
            .setBackground(COLOURS.PURPLE_200)
            .setBorder(1, COLOURS.BLACK)
            .setVisible(false);

        mainContainer.addChild(popupContainer, "Middle", "Middle");

        const titleLabel = new TextLabel(scene, 16, 16, "Title here", COLOURS.BLACK, {isBold: true, fontSize: 20});
        const contentLabel = new TextLabel(scene, 16, titleLabel.height + 32, "Content goes here...", COLOURS.BLACK, {
            maxWidth: popupContainer.width - 32
        });
        const nextButton = new TextButton(scene, 16, 16, 72, 28, "Next", COLOURS.WHITE)
            .setBackground(COLOURS.BLUE_100, COLOURS.BLUE_700)
            .setBorder(1, COLOURS.BLACK)
            .onClick(() => {
                guiController.nextMessagePrompt();
            });
        const doneButton = new TextButton(scene, 16, 16, 72, 28, "Ok", COLOURS.WHITE)
            .setBackground(COLOURS.BLUE_100, COLOURS.BLUE_700)
            .setBorder(1, COLOURS.BLACK)
            .onClick(() => {
                guiController.nextMessagePrompt();
            });

        popupContainer.addChild(titleLabel, "Top");
        popupContainer.addChild(contentLabel);
        popupContainer.addChild(nextButton, "Bottom", "Right");
        popupContainer.addChild(doneButton, "Bottom", "Right");

        guiController.messagePromptObservable()
            .pipe(
                withLatestFrom(guiController.isLastPromptObservable())
            )
            .subscribe(([messagePrompt, isLastPrompt]) => {
                if (messagePrompt == null) {
                    mainContainer.setVisible(false);
                } else {
                    mainContainer.setVisible(true);
                    if (messagePrompt.position != null) {
                        popupContainer.setPosition(messagePrompt.position.x, messagePrompt.position.y);
                    }
                    titleLabel.setText(messagePrompt.title);
                    contentLabel.setText(messagePrompt.content);

                    doneButton.setVisible(isLastPrompt);
                    nextButton.setVisible(!isLastPrompt);
                    
                }
            });
    }
}