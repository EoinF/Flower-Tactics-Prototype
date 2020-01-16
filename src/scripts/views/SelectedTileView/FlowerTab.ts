import { GameState } from "../../objects/GameState";
import { Tile } from "../../objects/Tile";
import { TextLabel } from "../../widgets/generic/TextLabel";
import { FlexUIContainer } from "../../widgets/generic/FlexUIContainer";
import { SelectedTileTab } from "./SelectedTileView";
import { COLOURS } from "../../constants";

export class FlowerTab implements SelectedTileTab {
    private mainContainer: FlexUIContainer;
    private titleText: TextLabel;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        this.mainContainer = new FlexUIContainer(scene, x, y);
        this.titleText = new TextLabel(scene, 8, 8, "...", COLOURS.BLACK, {isBold: true, align: 'left'});
        this.mainContainer
            .addChild(this.titleText)
            .setDepth(4)
            .setVisible(false);
    }
    
    show(gameState: GameState, tile: Tile) {
        this.mainContainer.setVisible(true);
        const flower = gameState.getFlowerAtTile(tile);
        let text = ["No flower"];
        
        if (flower != null) {
            const flowerTypeData = gameState.flowerTypes[flower.type];
            if (flower.growth < flowerTypeData.turnsUntilGrown) {
                text = [
                    flowerTypeData.name, 
                    `Growing for ${flowerTypeData.turnsUntilGrown} turns.`,
                    `${flower.growth} / ${flowerTypeData.turnsUntilGrown}`
                ];
            } else if (flower.growth < flowerTypeData.turnsUntilGrown + flowerTypeData.turnsUntilDead) {
                text = [
                    flowerTypeData.name,
                    `Producing seeds for ${flowerTypeData.turnsUntilDead} turns.`,
                    `${flower.growth - flowerTypeData.turnsUntilGrown} / ${flowerTypeData.turnsUntilDead}`
                ];
            } else {
                text = [
                    flowerTypeData.name,
                    `Producing seeds (Dying)`,
                    `Survived ${flower.growth - flowerTypeData.turnsUntilGrown - flowerTypeData.turnsUntilDead} extra turns.`
                ];
            }
        }

        this.titleText.setText(text);
    }

    hide() {
        this.mainContainer.setVisible(false);
    }
}