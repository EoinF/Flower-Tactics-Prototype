import { UIContainer } from "./UIContainer";
import { FlexUIContainer } from "./FlexUIContainer";
import { COLOURS } from "../../constants";
import { TextLabel } from "./TextLabel";
import { UIObject } from "./UIObject";
import { TextButton } from "./TextButton";

export class MainMenuContainer extends FlexUIContainer {
    private bottomPanel: UIContainer;

    constructor(scene: Phaser.Scene, title: string) {
        super(scene, 0, 0, 500, "grow", "Middle", "Middle");
        
        this.setBackground(COLOURS.PURPLE_200)
            .setBorder(1, COLOURS.PURPLE_400);

        this.addChild(new TextLabel(scene, 0, 16, title, COLOURS.BLACK, { isBold: true, fontSize: 24 }));
    }

    addChild(child: UIObject) {
        return super.addChild(child, "Top", "Middle");
    }

    addButton(scene: Phaser.Scene, label: string, onClick: (pointer: Phaser.Input.Pointer) => void) {
        return this.addChild(
            new TextButton(scene, 0, 8, 250, 40, label).onClick(onClick)
        );
    }

    addBackButton(scene: Phaser.Scene, label: string, onClick: (pointer: Phaser.Input.Pointer) => void) {
        if (this.bottomPanel == null) {
            this.bottomPanel = new UIContainer(scene, 0, 0, 500, 40);
            this.addChild(this.bottomPanel);
        }
        this.bottomPanel.addChild(
            new TextButton(scene, 16, 16, 96, 32, "Back", 
                COLOURS.BLACK,
                COLOURS.WHITE, COLOURS.LIGHT_GRAY,
                16
            ).onClick(onClick).setBorder(1, COLOURS.RED),
            "Bottom", "Left"
        );
        return this;
    }

    addFooterText(scene: Phaser.Scene, text: string) {
        if (this.bottomPanel == null) {
            this.bottomPanel = new UIContainer(scene, 0, 0, 500, 40);
            this.addChild(this.bottomPanel);
        }
        this.bottomPanel.addChild(
            new TextLabel(scene, 8, 8, text, COLOURS.BLACK),
            "Bottom", "Right"
        );
        return this;
    }
}