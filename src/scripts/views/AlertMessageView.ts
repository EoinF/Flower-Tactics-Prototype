import { GuiController } from "../controllers/GuiController";
import { UIContainer } from "../widgets/generic/UIContainer";
import { TextLabel } from "../widgets/generic/TextLabel";
import { COLOURS } from "../widgets/generic/constants";
import { of } from "rxjs";
import { delay } from "rxjs/operators";
import { ALERT_MESSAGE_TIMEOUT } from "../constants";

export class AlertMessageView {
    constructor(scene: Phaser.Scene, guiController: GuiController) {
        const mainContainer = new UIContainer(scene, 0, 0, 450, 50, "Middle", "Middle")
            .setBackground(COLOURS.PURPLE_200)
            .setBorder(1, COLOURS.BLACK)
            .setVisible(false);

        let alertTimeoutSubscription = of(undefined)
            .subscribe(() => {});
        guiController.alertMessageObservable().subscribe((messageText: string) => {
            alertTimeoutSubscription.unsubscribe();
            const textLabel = new TextLabel(scene, 0, 0, messageText, COLOURS.BLACK);
            mainContainer.clear()
                .addChild(textLabel, "Middle", "Middle")
                .setVisible(true);

            alertTimeoutSubscription = of(undefined).pipe(
                delay(ALERT_MESSAGE_TIMEOUT)
            ).subscribe(() => {
                mainContainer.setVisible(false);
            });
        });
    }
}