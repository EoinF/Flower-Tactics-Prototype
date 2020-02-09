import { MainMenuContainer } from "../../widgets/generic/MainMenuContainer";
import { MainMenuController } from "../../controllers/MainMenuController";
import { MapGenerator } from "../../MapGenerator";
import { GameStateController } from "../../controllers/GameStateController";

export class MainMenuView {
    constructor(scene: Phaser.Scene, mainMenuController: MainMenuController, gameStateController: GameStateController) {
        const container = new MainMenuContainer(scene, "Flower Strategy Prototype");

        container.addButton(scene, "Learn to Play", () => {
            mainMenuController.setActiveMenuScreen("TUTORIAL_SELECT");
        });

        container.addButton(scene, "New Game", () => {
            mainMenuController.setActiveMenuScreen("NEW_GAME");
        });

        // container.addButton(scene, "Testing", () => {
        //     mainMenuController.loadLevel("test");
        // });

        container.addButton(scene, "Generate New Map", () => {
            const generatedMap =
                new MapGenerator(0).generateNewMap({numTilesX: 15, numTilesY: 20})
            
            gameStateController.loadGame(generatedMap);
        });

        container.addFooterText(scene, "version 1.0");

        mainMenuController.activeMenuScreenObservable().subscribe(activeMenu => {
            container.setVisible(activeMenu === "MAIN_MENU");
        })
    }
}