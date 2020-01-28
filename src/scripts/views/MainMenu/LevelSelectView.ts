import { MainMenuController } from "../../controllers/MainMenuController";
import { TextButton } from "../../widgets/generic/TextButton";
import { TextLabel } from "../../widgets/generic/TextLabel";
import { COLOURS } from "../../constants";
import { MainMenuContainer } from "../../widgets/generic/MainMenuContainer";

export class LevelSelectView {
    private loadingMessage: TextLabel;

    constructor(scene: Phaser.Scene, mainMenuController: MainMenuController) {
        const container = new MainMenuContainer(scene, "Select a Level to Play");

        const maps = [
            { label: "Tutorial 1", mapName: "tutorial1" },
            { label: "Tutorial 2", mapName: "tutorial2" },
            { label: "Tutorial 3", mapName: "tutorial3" },
            { label: "Test", mapName: "test" },
        ];

        maps.forEach(level => {
            container.addButton(scene, level.label, () => {
                mainMenuController.loadLevel(level.mapName)
            });
        })
        
        this.loadingMessage = new TextLabel(scene, 0, 8, "", COLOURS.BLACK, { isBold: true})
            .setOrigin(0.5, 0.5);
        container.addChild(this.loadingMessage);
        
        container.addBackButton(scene, "Back to Main Menu", () => {
            mainMenuController.setActiveMenuScreen("MAIN_MENU");
        });

        mainMenuController.loadStateObservable().subscribe(loadState => {
            if (loadState === 'LOADING_GAME_ASSETS') {
                this.loadingMessage.setText("Loading game assets...");
            } else if (loadState === 'LOADING_MAP_DATA') {
                this.loadingMessage.setText("Loading map data...");
            } else {
                this.loadingMessage.setText("");
            }
        });
        
        mainMenuController.activeMenuScreenObservable().subscribe(activeMenu => {
            container.setVisible(activeMenu === "LEVEL_SELECT");
        })
    }
}