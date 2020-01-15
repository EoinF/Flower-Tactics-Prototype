import { UIContainer } from "../../widgets/generic/UIContainer";
import { COLOURS } from "../../constants";
import { EvolveSeedController } from "../../controllers/EvolveSeedController";
import { BaseUIObject } from "../../widgets/generic/UIObject";
import { merge } from "rxjs";
import { TextLabel } from "../../widgets/generic/TextLabel";
import { mapTo, startWith, withLatestFrom } from "rxjs/operators";
import { TextButton } from "../../widgets/generic/TextButton";
import { FlexUIContainer } from "../../widgets/generic/FlexUIContainer";
import { BaseButton } from "../../widgets/generic/BaseButton";
import { ContainerButton } from "../../widgets/generic/ContainerButton";

export class EvolveChoiceView extends BaseUIObject {
    constructor(scene: Phaser.Scene, evolveSeedController: EvolveSeedController) {
        super(scene, 0, 0, scene.game.canvas.width, scene.game.canvas.height, "Middle", "Middle");
        this.container.setBackground(COLOURS.withAlpha(COLOURS.GRAY, 0.7));

        const popupContainer = new FlexUIContainer(scene, 0, 0, 700, 400)
            .setBackground(COLOURS.PURPLE_200)
            .setBorder(1, COLOURS.BLACK);

    
        this.container.addChild(popupContainer, "Middle", "Middle");

        const titleLabel = new TextLabel(scene, 16, 16, "Evolve Success!", COLOURS.BLACK, {isBold: true, fontSize: 20});
        const contentLabel = new TextLabel(scene, 16, 24 + titleLabel.height, "Choose your flower upgrades", COLOURS.BLACK, {
            maxWidth: popupContainer.width - 32
        });

        const contentContainer = new UIContainer(scene, 8, 40 + titleLabel.height + contentLabel.height,
            popupContainer.width - 16, popupContainer.height - (48 + titleLabel.height + contentLabel.height)
        );

        popupContainer.addChild(titleLabel, "Top");
        popupContainer.addChild(contentLabel);
        popupContainer.addChild(contentContainer);

        evolveSeedController.isEvolveChoiceShownObservable()
            .pipe(
                withLatestFrom(evolveSeedController.evolveChoicesObservable().pipe(
                    startWith([])
                ))
            ).subscribe(([isEvolveChoiceShown, choices]) => {
                this.setVisible(isEvolveChoiceShown);

                if (isEvolveChoiceShown) {
                    contentContainer.clear();
                    const PADDING = 8;
                    const totalPaddingWidth = (PADDING * (choices.length - 1));
                    const widthPerChoice = (contentContainer.width - totalPaddingWidth) / choices.length;

                    choices.forEach((choice, index) => {
                        const choiceColumn = new ContainerButton(scene, index * (PADDING + widthPerChoice), 0,
                            widthPerChoice, contentContainer.height,
                            COLOURS.PURPLE_600, COLOURS.PURPLE_500
                        )
                            .setBorder(1, COLOURS.BLACK)
                            .onClick(() => evolveSeedController.selectEvolveChoice(index));
                        const choiceNameLabel = new TextLabel(scene, 0, 8, choice.newFlowerName, COLOURS.WHITE,
                            { maxWidth: widthPerChoice - 8, isBold: true, fontSize: 18 }
                        );
                        const choiceAttributesLabel = new TextLabel(scene, 0, 32 + choiceNameLabel.height, `choice ${index}`, COLOURS.WHITE,
                            { maxWidth: widthPerChoice - 8 }
                        );
                        choiceColumn.addChild(choiceNameLabel, "Top", "Middle");
                        choiceColumn.addChild(choiceAttributesLabel, "Top", "Middle");
                        contentContainer.addChild(choiceColumn);
                    })
                } else {
                    contentContainer.clear();
                }
            })
    }
}