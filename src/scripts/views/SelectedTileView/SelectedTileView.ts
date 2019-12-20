import { GameStateManager } from "../../controllers/GameStateManager";
import { Tile } from "../../objects/Tile";
import { SelectedObjectController } from "../../controllers/SelectedObjectController";
import { UIContainer } from "../../widgets/generic/UIContainer";
import { ImageButton } from "../../widgets/generic/ImageButton";
import { RadioButtonGroup } from "../../widgets/generic/RadioButtonGroup";
import { combineLatest } from "rxjs";
import { GameState } from "../../objects/GameState";
import { FlowerTab } from "./FlowerTab";
import { SoilTab } from "./SoilTab";
import { COLOURS } from "../../constants";

export interface SelectedTileTab {
    show: (gameState: GameState, tile: Tile) => void;
    hide: () => void;
}

export class SelectedTileView {
    x: number;
    y: number;
    width: number;
    height: number;

    private popup: UIContainer;

    private npkTabButton: ImageButton;
    private flowerTabButton: ImageButton;

    private tabs: SelectedTileTab[];

    constructor(scene: Phaser.Scene, gameStateManager: GameStateManager, SelectedObjectController: SelectedObjectController) {
        this.popup = new UIContainer(scene, 8, 8, 412, 96, "Bottom")
            .setVisible(false)
            .setInteractive()
            .setDepth(2)
            .setBackground(COLOURS.PURPLE_100)
            .setBorder(1, COLOURS.PURPLE_700);

        this.x = this.popup.x;
        this.y = this.popup.y;
        this.width = this.popup.width;
        this.height = this.popup.height;
        
        this.npkTabButton = new ImageButton(scene, 2, 2, 'button-npk')
            .setBackground(COLOURS.PURPLE_200, COLOURS.PURPLE_400, COLOURS.WHITE, COLOURS.PURPLE_500)
            .setBorder(1, COLOURS.GRAY);
        this.flowerTabButton = new ImageButton(scene, 4 + this.npkTabButton.width, 2, 'button-flower')
            .setBackground(COLOURS.PURPLE_200, COLOURS.PURPLE_400, COLOURS.WHITE, COLOURS.PURPLE_500)
            .setBorder(1, COLOURS.GRAY);

        const tabGroup = new RadioButtonGroup([this.npkTabButton, this.flowerTabButton])
            .onChange((_, index) => {
                SelectedObjectController.setActiveTabIndex(index);
            });
        
        const flowerTab = new FlowerTab(scene, this.x, this.y);
        const soilTab = new SoilTab(scene, this.x, this.y);
        this.tabs = [soilTab, flowerTab];

        this.popup.addChild(this.npkTabButton, "Top", "Right");
        this.popup.addChild(this.flowerTabButton, "Top", "Right");

        combineLatest(gameStateManager.nextStateObservable(),
            SelectedObjectController.selectedTileObservable(),
            SelectedObjectController.activeTabObservable()
        ).subscribe(([newState, activeTile, activeTab]) => {
            this.tabs.forEach(tab => tab.hide());
            if (activeTile != null) {
                this.popup.setVisible(true);
                const tile = newState.getTileAt(activeTile.x, activeTile.y)!;
                this.updatePopupText(newState, tile, activeTab);
            } else {
                this.popup.setVisible(false);
            }
        });
    }

    private updatePopupText(gameState: GameState, tile: Tile, activeTab: number) {
        this.tabs[activeTab].show(gameState, tile);
    }
}