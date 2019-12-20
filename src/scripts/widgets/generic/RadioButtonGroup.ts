import { BaseButton } from "./BaseButton";
import { ImageButton } from "./ImageButton";
import { COLOURS } from "../../constants";

export class RadioButtonGroup {
    selectedButtonIndex: number;
    private buttons: Array<BaseButton>;
    private callbacks: Array<(button: BaseButton, index: number) => void>;
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
        this.selectedColourUp = selectedColourUp;
        this.selectedColourDown = selectedColourDown;
        this.selectedBorderColour = selectedBorderColour;
        this.selectedBorderThickness = selectedBorderThickness;

        this.callbacks = [];
        if (buttons.length > 0) {
            this.setButtons(buttons);
        } else {
            this.selectedButtonIndex = -1;
        }
    }

    private restoreButtonColours() {
        if (this.selectedButtonIndex >= 0) {
            const button = this.buttons[this.selectedButtonIndex];
            if (button instanceof ImageButton) {
                button.setBackground(this.savedColourUp, this.savedColourDown, this.savedImageColourUp, this.savedImageColourDown);
            } else {
                button.setBackground(this.savedColourUp, this.savedColourDown);
            }
            button.setBorder(this.savedBorderThickness, this.savedBorderColour);
        }
    }

    setSelected(indexOrButton: number | BaseButton) {
        let index: number;
        if (indexOrButton instanceof BaseButton) {
            index = this.buttons.indexOf(indexOrButton);
        } else {
            index = indexOrButton;
        }
        this.restoreButtonColours();
        this._setSelected(index);
    }

    _setSelected(index: number) {
        if (this.buttons.length > 0) {
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
    }

    setButtons(buttons: BaseButton[]) {
        this.buttons = buttons;
        
        buttons.forEach((button, index) => {
            button.onClick(() => {
                this.restoreButtonColours();
                this._setSelected(index);
                this.callbacks.forEach(f => f(button, index));
            });
        });
    }

    onChange(callback: (button: BaseButton, index: number) => void) {
        this.callbacks.push(callback);
        return this;
    }
}