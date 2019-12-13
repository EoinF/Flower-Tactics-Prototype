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
        const mainContainer = new UIContainer(scene, 0, 0, 300, 200, "Middle", "Middle")
            .setBackground(COLOURS.PURPLE_200)
            .setBorder(1, COLOURS.BLACK)
            .setVisible(false);

        const titleLabel = new TextLabel(scene, 16, 16, "Title here", COLOURS.BLACK, {isBold: true, fontSize: 20});
        const contentLabel = new TextLabel(scene, 16, titleLabel.height + 32, "Content goes here...", COLOURS.BLACK, {
            maxWidth: mainContainer.width - 32
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

        mainContainer.addChild(titleLabel, "Top");
        mainContainer.addChild(contentLabel);
        mainContainer.addChild(nextButton, "Bottom", "Right");
        mainContainer.addChild(doneButton, "Bottom", "Right");


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
                        mainContainer.setPosition(messagePrompt.position.x, messagePrompt.position.y);
                    }
                    titleLabel.setText(messagePrompt.title);
                    contentLabel.setText(messagePrompt.content);

                    doneButton.setVisible(isLastPrompt);
                    nextButton.setVisible(!isLastPrompt);
                    
                }
            });
    }
}