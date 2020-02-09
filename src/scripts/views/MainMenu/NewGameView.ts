import { MainMenuController } from "../../controllers/MainMenuController";
import { TextLabel } from "../../widgets/generic/TextLabel";
import { COLOURS } from "../../constants";
import { MainMenuContainer } from "../../widgets/generic/MainMenuContainer";
import { ArrowSelectionWidget } from "../../widgets/generic/ArrowSelectionWidget";
import { UIContainer } from "../../widgets/generic/UIContainer";
import { withLatestFrom, filter } from "rxjs/operators";
import { Subject, combineLatest, ReplaySubject } from "rxjs";
import { TextButton } from "../../widgets/generic/TextButton";

export class NewGameView {
    private loadingMessage: TextLabel;

    constructor(scene: Phaser.Scene, mainMenuController: MainMenuController) {
        let container: MainMenuContainer | null = null;
        const assetsLoadingMessageContainer = new UIContainer(scene, 0, 0, 200, 100, "Middle", "Middle");
        assetsLoadingMessageContainer.addChild(new TextLabel(scene, 0, 0, "Loading..."), "Middle", "Middle");

        mainMenuController.onFinishedLoadingGameAssetsObservable().pipe(
            withLatestFrom(mainMenuController.activeMenuScreenObservable())
        ).subscribe(([_, activeMenu]) => {
            assetsLoadingMessageContainer.destroy();
            
            container = new MainMenuContainer(scene, "Start a New Game")
                .setVisible(activeMenu === "NEW_GAME");
            const maps = ["River", "Circles"];
            const players = ["Human", "CPU"];
            const playersMap = {
                "Human": "Human",
                "CPU": "AI_1"
            }
            const selectedMap$ = new ReplaySubject<string>(1);
            const selectedPlayer1$ = new ReplaySubject<string>(1);
            const selectedPlayer2$ = new ReplaySubject<string>(1);
            const onClickBegin$ = new Subject();
            selectedMap$.next(maps[0]);
            selectedPlayer1$.next(players[0]);
            selectedPlayer2$.next(players[1]);
            
            const mapSelection = new ArrowSelectionWidget(scene, 0, 4, 300, 32, maps).onChange(choice => {
                selectedMap$.next(choice);
            });
            const player1Selection = new ArrowSelectionWidget(scene, 0, 4, 300, 32, players).onChange(choice => {
                selectedPlayer1$.next(choice);
            });
            const player2Selection = new ArrowSelectionWidget(scene, 0, 4, 300, 32, players, 1).onChange(choice => {
                selectedPlayer2$.next(choice);
            });

            container.addChild(new TextLabel(scene, 0, 0, "map name", COLOURS.BLACK, { isBold: true, fontSize: 12}));
            container.addChild(mapSelection);
            container.addChild(new TextLabel(scene, 0, 0, "player 1", COLOURS.BLACK, { isBold: true, fontSize: 12}));
            container.addChild(player1Selection);
            container.addChild(new TextLabel(scene, 0, 0, "player 2", COLOURS.BLACK, { isBold: true, fontSize: 12}));
            container.addChild(player2Selection);
            
            this.loadingMessage = new TextLabel(scene, 0, 8, "", COLOURS.BLACK, { isBold: true})
                .setOrigin(0.5, 0.5);
            container.addChild(this.loadingMessage);
            
            container.addBackButton(scene, "Back to Main Menu", () => {
                mainMenuController.setActiveMenuScreen("MAIN_MENU");
            });
            const beginButton = container.addConfirmButton(scene, "Begin", () => {
                onClickBegin$.next();
            })

            combineLatest(
                selectedPlayer1$,
                selectedPlayer2$
            ).subscribe(([player1, player2]) => {
                if (player1 === 'Human' && player2 === 'Human') {
                    beginButton.setAlpha(0.3);
                    beginButton.setActive(false);
                    this.loadingMessage.setText("Human vs Human not supported");
                } else {
                    beginButton.setAlpha(1);
                    beginButton.setActive(true);
                    this.loadingMessage.setText("");
                }
            });

            onClickBegin$.pipe(
                withLatestFrom(selectedMap$, selectedPlayer1$, selectedPlayer2$)
            ).subscribe(([_, mapName, player1, player2]) => {
                let playerType1 = playersMap[player1];
                let playerType2 = playersMap[player2];
                mainMenuController.loadLevel(mapName, { player1: playerType1, player2: playerType2 });
            });
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
            if (container != null) {
                container.setVisible(activeMenu === "NEW_GAME");
            }
            assetsLoadingMessageContainer.setVisible(activeMenu === 'NEW_GAME');
        })
    }
}