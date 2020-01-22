import { MainMenuController } from "../../controllers/MainMenuController";
import { TextButton } from "../../widgets/generic/TextButton";
import { UIContainer } from "../../widgets/generic/UIContainer";
import { TextLabel } from "../../widgets/generic/TextLabel";
import { COLOURS } from "../../constants";
import { FlexUIContainer } from "../../widgets/generic/FlexUIContainer";

export class LevelSelectView {
    private container: UIContainer;
    private loadingMessage: TextLabel;
    constructor(scene: Phaser.Scene, mainMenuController: MainMenuController) {
        this.container = new FlexUIContainer(scene, 0, 0, 500, "grow", "Middle", "Middle")
            .setBackground(COLOURS.PURPLE_200)
            .setBorder(1, COLOURS.PURPLE_400);

        this.container.addChild(new TextLabel(scene, 0, 16, "Select a Level to Play", COLOURS.BLACK, { isBold: true, fontSize: 24 }),
            "Top", 
            "Middle"
        );

        const maps = [
            { label: "Tutorial 1", mapName: "tutorial1" },
            { label: "Tutorial 2", mapName: "tutorial2" },
            { label: "vs CPU", mapName: "1v1" },
            { label: "Test", mapName: "test" },
        ];

        maps.forEach(level => {
            this.container.addChild(new TextButton(scene, 0, 8, 200, 40, level.label)
                .onClick(() => {
                    mainMenuController.loadLevel(level.mapName)
                }),
                "Top",
                "Middle"
            );
        })
        
        this.loadingMessage = new TextLabel(scene, 0, 8, "", COLOURS.BLACK, { isBold: true})
            .setOrigin(0.5, 0.5);
        this.container.addChild(this.loadingMessage, "Top", "Middle");

        mainMenuController.loadStateObservable().subscribe(loadState => {
            if (loadState === 'LOADING_GAME_ASSETS') {
                this.loadingMessage.setText("Loading game assets...");
            } else if (loadState === 'LOADING_MAP_DATA') {
                this.loadingMessage.setText("Loading map data...");
            } else {
                this.loadingMessage.setText("");
            }
        });
    }
}