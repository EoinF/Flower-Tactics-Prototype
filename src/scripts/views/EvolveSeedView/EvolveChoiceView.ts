import { UIContainer } from "../../widgets/generic/UIContainer";
import { COLOURS } from "../../constants";
import { EvolveSeedController } from "../../controllers/EvolveSeedController";
import { BaseUIObject } from "../../widgets/generic/UIObject";
import { TextLabel } from "../../widgets/generic/TextLabel";
import { startWith, withLatestFrom } from "rxjs/operators";
import { FlexUIContainer } from "../../widgets/generic/FlexUIContainer";
import { ContainerButton } from "../../widgets/generic/ContainerButton";

export class EvolveChoiceView extends BaseUIObject {
    constructor(scene: Phaser.Scene, evolveSeedController: EvolveSeedController) {
        super(scene, 0, 0, scene.game.canvas.width, scene.game.canvas.height, "Middle", "Middle");
        this.container.setBackground(COLOURS.withAlpha(COLOURS.GRAY, 0.7));

        const popupContainer = new FlexUIContainer(scene, 0, 0, 1000, 400)
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

                        const sortedDeltas = choice.newFlowerDelta.getDeltas()
                            .sort(
                                (a,b) => a.keys[a.keys.length - 1].toString().localeCompare(b.keys[b.keys.length - 1].toString())
                            );
                        const choiceNames = sortedDeltas.map(delta => {
                            let name = delta.keys[delta.keys.length - 1];
                            return `${name}:`;
                        });
                        const choiceValues = sortedDeltas.map(delta => {
                            const value = delta.deltaValue as number;
                            const signText = value > 0 ? '+' : '-';
                            return `${signText} ${Math.abs(value)}`
                        });

                        const choiceAttributesContainer = new FlexUIContainer(scene, 0, 32 + choiceNameLabel.height, "grow", "auto");
                        const choiceAttributeNamesLabel = new TextLabel(scene, 0, 0, choiceNames, COLOURS.WHITE)
                            .setOrigin(0, 0);
                        const choiceAttributeValuesLabel = new TextLabel(scene, 32, 0, choiceValues, COLOURS.WHITE)
                            .setOrigin(0, 0);
                        choiceAttributesContainer.addChild(choiceAttributeNamesLabel);
                        choiceAttributesContainer.addChild(choiceAttributeValuesLabel);
                        choiceColumn.addChild(choiceNameLabel, "Top", "Middle");
                        choiceColumn.addChild(choiceAttributesContainer, "Top", "Middle");
                        contentContainer.addChild(choiceColumn);
                    })
                } else {
                    contentContainer.clear();
                }
            })
    }
}