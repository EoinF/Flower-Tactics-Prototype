import { MainMenuContainer } from "../../widgets/generic/MainMenuContainer";
import { MainMenuController } from "../../controllers/MainMenuController";
import { MapGenerator } from "../../MapGenerator";
import { gameStateController } from "../../game";
import { GameStateController } from "../../controllers/GameStateController";

export class MainMenuView {
    constructor(scene: Phaser.Scene, mainMenuController: MainMenuController, gameStateController: GameStateController) {
        const container = new MainMenuContainer(scene, "Flower Strategy Prototype");

        container.addButton(scene, "Learn to Play", () => {
            mainMenuController.setActiveMenuScreen("LEVEL_SELECT");
        });

        container.addButton(scene, "vs CPU", () => {
            mainMenuController.loadLevel("1v1");
        });
        container.addButton(scene, "Testing", () => {
            mainMenuController.loadLevel("test");
        });

        container.addButton(scene, "Generate Map", () => {
            gameStateController.loadGame(
                new MapGenerator(0).generateNewMap({numTilesX: 15, numTilesY: 20})
            );
        })
        
        container.addButton(scene, "Give feedback", () => {
            
        });

        container.addFooterText(scene, "version 1.0");

        mainMenuController.activeMenuScreenObservable().subscribe(activeMenu => {
            container.setVisible(activeMenu === "MAIN_MENU");
        })
    }
}