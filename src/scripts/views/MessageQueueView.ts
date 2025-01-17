import { GuiController } from "../controllers/GuiController";
import { UIContainer } from "../widgets/generic/UIContainer";
import { COLOURS } from "../constants";
import { TextLabel } from "../widgets/generic/TextLabel";
import { TextButton } from "../widgets/generic/TextButton";
import { withLatestFrom } from "rxjs/operators";
import { BaseUIObject } from "../widgets/generic/UIObject";

export interface MessagePromptWithDelay {
    position: {x: number, y: number} | undefined;
    title: string;
    content: string;
    delay: number;
}
export interface MessagePromptWithoutDelay {
    position: {x: number, y: number} | undefined;
    title: string;
    content: string;
}

export type MessagePrompt = MessagePromptWithDelay | MessagePromptWithoutDelay;

export class MessageQueueView extends BaseUIObject {
    constructor(scene: Phaser.Scene, guiController: GuiController) {
        super(scene, 0, 0, scene.game.canvas.width, scene.game.canvas.height);
        this.container.setBackground(COLOURS.withAlpha(COLOURS.GRAY, 0.7));
        const popupContainer = new UIContainer(scene, 0, 0, 300, 200)
            .setBackground(COLOURS.PURPLE_200)
            .setBorder(1, COLOURS.BLACK)
            .setVisible(false);

        this.container.addChild(popupContainer, "Middle", "Middle");

        const titleLabel = new TextLabel(scene, 16, 16, "Title here", COLOURS.BLACK, {isBold: true, fontSize: 20});
        const contentLabel = new TextLabel(scene, 16, titleLabel.height + 32, "Content goes here...", COLOURS.BLACK, {
            align: 'left',
            maxWidth: popupContainer.width - 32
        });
        const nextButton = new TextButton(scene, 16, 16, 72, 28, "Next", COLOURS.WHITE)
            .setBackground(COLOURS.BLUE_500, COLOURS.BLUE_700)
            .setBorder(1, COLOURS.BLACK)
            .onClick(() => {
                guiController.nextMessagePrompt();
            });
        const doneButton = new TextButton(scene, 16, 16, 72, 28, "Ok", COLOURS.WHITE)
            .setBackground(COLOURS.BLUE_500, COLOURS.BLUE_700)
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
                    this.setVisible(false);
                } else {
                    this.setVisible(true);
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