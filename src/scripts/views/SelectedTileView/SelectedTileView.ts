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
import { GuiController } from "../../controllers/GuiController";
import { mapController, heldObjectController } from "../../game";
import { MapController } from "../../controllers/MapController";
import { withLatestFrom, filter } from "rxjs/operators";

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

    constructor(scene: Phaser.Scene, gameStateManager: GameStateManager, selectedObjectController: SelectedObjectController, mapController: MapController) {
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
                selectedObjectController.setActiveTabIndex(index);
            })
            .setSelected(0);

        const flowerTab = new FlowerTab(scene, this.x, this.y);
        const soilTab = new SoilTab(scene, this.x, this.y);
        this.tabs = [soilTab, flowerTab];

        this.popup.addChild(this.npkTabButton, "Top", "Right");
        this.popup.addChild(this.flowerTabButton, "Top", "Right");

        mapController.clickTileObservable()
        .pipe(
            withLatestFrom(heldObjectController.heldObjectObservable()),
            filter(([_, heldObject]) => heldObject == null)
        ).subscribe(([tileIndex]) => {
            selectedObjectController.setSelectedTile(tileIndex);
        })

        combineLatest(
            gameStateManager.nextStateObservable(),
            selectedObjectController.selectedTileObservable(),
            selectedObjectController.activeTabObservable()
        ).subscribe(([newState, tileIndex, activeTab]) => {
            this.tabs.forEach(tab => tab.hide());
            if (tileIndex != null) {
                this.popup.setVisible(true);
                const tile = newState.tiles[tileIndex];
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