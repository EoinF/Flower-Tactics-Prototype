import { GameState } from "../../objects/GameState";
import { Tile } from "../../objects/Tile";
import { TextLabel } from "../../widgets/generic/TextLabel";
import { COLOURS } from "../../widgets/generic/constants";
import { FlexUIContainer } from "../../widgets/generic/FlexUIContainer";
import { SelectedTileTab } from "./SelectedTileView";

export class FlowerTab implements SelectedTileTab {
    private mainContainer: FlexUIContainer;
    private titleText: TextLabel;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        this.mainContainer = new FlexUIContainer(scene, x, y);
        this.titleText = new TextLabel(scene, 8, 8, "...", COLOURS.BLACK, true);
        this.mainContainer
            .addChild(this.titleText)
            .setDepth(4)
            .setVisible(false);
    }
    
    show(gameState: GameState, tile: Tile) {
        this.mainContainer.setVisible(true);
        const flowers = gameState.getFlowersAtTile(tile);
        let titleText = "Plains";
        if (gameState.getRiverAtTile(tile) != null) {
            titleText = "River";
        } else if (gameState.getMountainAtTile(tile) != null) {
            titleText = "Mountains";
        }
        
        let lines = [
            titleText,
            ...flowers.map(flower => {
                const flowerTypeData = gameState.flowerTypes[flower.type];
                return `${flowerTypeData.name}: ${flower.growth} / ${flowerTypeData.turnsUntilGrown}`;
            })
        ];

        this.titleText.setText(lines);
    }

    hide() {
        this.mainContainer.setVisible(false);
    }
}