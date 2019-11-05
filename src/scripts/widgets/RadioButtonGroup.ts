import { BaseButton } from "./BaseButton";
import { COLOURS } from "./constants";
import { ImageButton } from "./ImageButton";

export class RadioButtonGroup {
    selectedButtonIndex: number;
    private buttons: Array<BaseButton>;
    private callbacks: Array<Function>;
    private selectedColourUp: Phaser.Display.Color;
    private selectedColourDown: Phaser.Display.Color;
    private selectedBorderThickness: number;
    private selectedBorderColour: Phaser.Display.Color;
    ///
    /// Save the previous colours of the selected button so they can be restored when it becomes unselected
    ///
    private savedColourUp: Phaser.Display.Color;
    private savedColourDown: Phaser.Display.Color;
    private savedBorderThickness: number;
    private savedBorderColour: Phaser.Display.Color;
    private savedImageColourUp?: Phaser.Display.Color;
    private savedImageColourDown?: Phaser.Display.Color;
    constructor(
        buttons: Array<BaseButton>,
        selectedColourUp: Phaser.Display.Color = COLOURS.LIGHT_YELLOW,
        selectedColourDown: Phaser.Display.Color = COLOURS.YELLOW,
        selectedBorderColour: Phaser.Display.Color = COLOURS.BLACK,
        selectedBorderThickness: number = 1
    ) {
        this.buttons = buttons;
        this.callbacks = [];
        this.selectedColourUp = selectedColourUp;
        this.selectedColourDown = selectedColourDown;
        this.selectedBorderColour = selectedBorderColour;
        this.selectedBorderThickness = selectedBorderThickness;
        this.setButtonSelected(0);

        buttons.forEach((button) => {
            button.onClick(() => {
                const index = this.buttons.indexOf(button);
                this.restoreButtonColours()
                this.setButtonSelected(index);
                this.callbacks.forEach(f => f(index));
            });
        });
    }

    private restoreButtonColours() {
        const button = this.buttons[this.selectedButtonIndex];
        if (button instanceof ImageButton) {
            button.setBackground(this.savedColourUp, this.savedColourDown, this.savedImageColourUp, this.savedImageColourDown);
        } else {
            button.setBackground(this.savedColourUp, this.savedColourDown);
        }
        button.setBorder(this.savedBorderThickness, this.savedBorderColour);
    }

    private setButtonSelected(index: number) {
        this.selectedButtonIndex = index;
        const button = this.buttons[index];
        this.savedColourUp = button.colourUp;
        this.savedColourDown = button.colourDown;
        this.savedBorderColour = button.borderColour;
        this.savedBorderThickness = button.borderThickness;

        if (button instanceof ImageButton) {
            this.savedImageColourUp = button.colourImageUp;
            this.savedImageColourDown = button.colourImageDown;
            button.setBackground(this.selectedColourUp, this.selectedColourDown, this.selectedColourUp, this.selectedColourDown);
        } else {
            button.setBackground(this.selectedColourUp, this.selectedColourDown);
        }

        button.setBorder(this.selectedBorderThickness, this.selectedBorderColour);
    }

    onChange(callback: Function) {
        this.callbacks.push(callback);
        return this;
    }
}