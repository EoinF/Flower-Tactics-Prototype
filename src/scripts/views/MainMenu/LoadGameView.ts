import { MainMenuController } from "../../controllers/MainMenuController";
import { TextButton } from "../../widgets/generic/TextButton";
import { TextLabel } from "../../widgets/generic/TextLabel";
import { COLOURS } from "../../constants";
import { MainMenuContainer } from "../../widgets/generic/MainMenuContainer";
import { SavedGameController } from "../../controllers/SavedGameController";
import { withLatestFrom, switchMap, filter } from "rxjs/operators";
import { FlexUIContainer } from "../../widgets/generic/FlexUIContainer";

export class LoadGameView {
    constructor(scene: Phaser.Scene, mainMenuController: MainMenuController, savedGameController: SavedGameController) {
        const savedGames$ = savedGameController.savedGamesObservable();
        const activeMenu$ = mainMenuController.activeMenuScreenObservable();

        let container: MainMenuContainer;
        let loadingMessage: TextLabel;

        activeMenu$.subscribe(activeMenu => {
            if (container != null) {
                container.setVisible(activeMenu === 'LOAD_GAME');
            }
        });

        savedGames$.pipe(
            switchMap(() => activeMenu$),
            filter(activeMenu => activeMenu === 'LOAD_GAME'),
            withLatestFrom(savedGames$)
        ).subscribe(([_, savedGames]) => {
            if (container != null) {
                container.destroy();
            }
            container = new MainMenuContainer(scene, "Load Game");

            savedGames.forEach(savedGame => {
                const savedGameContainer = new FlexUIContainer(scene, 0, 4, "grow", "auto");
                savedGameContainer.addChild(new TextButton(scene, 0, 0, 150, 32, savedGame.mapName)
                    .onClick(() => {
                        mainMenuController.loadMap(savedGame.state);
                    }),
                    "Middle"
                )
                savedGameContainer.addChild(
                    new TextLabel(scene, 32, 0, savedGame.date, COLOURS.BLACK, { fontSize: 12, isBold: true }),
                    "Middle"
                );
                container.addChild(savedGameContainer);
            })
            
            loadingMessage = new TextLabel(scene, 0, 8, "", COLOURS.BLACK, { isBold: true})
                .setOrigin(0.5, 0.5);
            container.addChild(loadingMessage);
            
            container.addBackButton(scene, "Back", () => {
                mainMenuController.setActiveMenuScreen("MAIN_MENU");
            });
        });

        mainMenuController.loadStateObservable().subscribe(loadState => {
            if (loadingMessage != null) {
                if (loadState === 'LOADING_GAME_ASSETS') {
                    loadingMessage.setText("Loading game assets...");
                } else if (loadState === 'LOADING_MAP_DATA') {
                    loadingMessage.setText("Loading map data...");
                } else if (loadState === 'FINISHED') {
                    loadingMessage.setText("Creating map sprites...");
                }
            }
        });
    }
}