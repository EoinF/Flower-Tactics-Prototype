import { TextLabel } from "../generic/TextLabel";
import { COLOURS } from "../generic/constants";
import { ImageButton } from "../generic/ImageButton";
import { pairwise, filter, delay, map } from "rxjs/operators";
import { merge } from "rxjs";

export class PlacedSeedWidget extends ImageButton {
    private amount: number;
    private amountText: TextLabel;

    constructor(scene: Phaser.Scene,
        x: number, y: number,
        width: number, height: number,
        seedAmount: number
    ) {
        super(scene, x, y, "seed2", width, height, COLOURS.TRANSPARENT, COLOURS.TRANSPARENT);
        this.amount = seedAmount;
        this.amountText = new TextLabel(scene, x + 20, y + 4, seedAmount.toString(), COLOURS.WHITE, false, 14, 2)
             .setOrigin(1, 0);

        if (this.amount < 2) {
            this.amountText.setVisible(false);
        }
    }

    getAmount() {
        return this.amount;
    }

    setAmount(newAmount: number) {
        this.amount = newAmount;
        this.amountText.setText(this.amount.toString());
        if (this.amount > 1) {
            this.amountText.setVisible(true);
        }
    }

    onHold(callback:  (location: {x: number, y: number}) => void) {
        const delayReachedAfterPointerDown$ = this.pointerState$.pipe(
            filter(pointerState => pointerState.actionType == "pointerDown"),
            map(state => ({actionType: "delayReachedAfterPointerDown", pointer: {x: state.pointer.x, y: state.pointer.y} })),
            delay(250)
        );
        merge(delayReachedAfterPointerDown$, this.pointerState$).pipe(
            pairwise(),
            filter(([previousState, currentState]) =>
                previousState.actionType === "pointerDown" 
                && currentState.actionType == "delayReachedAfterPointerDown"),
            map(([_, currentState]) => ({x: currentState.pointer.x, y: currentState.pointer.y}))
        ).subscribe(pointerLocation => callback(pointerLocation));
        return this;
    }

    destroy() {
        super.destroy();
        this.amountText.destroy();
    }
}