import { withLatestFrom, map, filter } from "rxjs/operators";
import { BaseUIObject } from "../../widgets/generic/UIObject";
import { COLOURS } from "../../constants";
import { TextLabel } from "../../widgets/generic/TextLabel";
import { FlexUIContainer } from "../../widgets/generic/FlexUIContainer";
import { FlowerStatsDisplay } from "../../widgets/specific/FlowerStatsDisplay";
import { GameStateController } from "../../controllers/GameStateController";
import { FlowerSelectionController } from "../../controllers/FlowerSelectionController";

export class SeedStatsView extends BaseUIObject {
    titleLabel: TextLabel;
    
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number,
        gameStateController: GameStateController, flowerSelectionController: FlowerSelectionController
    ) {
        super(scene, x, y, width, height);
        this.container.setBackground(COLOURS.PURPLE_200)
            .setBorder(1, COLOURS.BLACK)

        this.titleLabel = new TextLabel(scene, 0, 8, "Flower Title", COLOURS.BLACK, {isBold: true, fontSize: 18}),
        this.container.addChild(this.titleLabel, "Top", "Middle");

        const growingContainer = new FlexUIContainer(scene, 16, this.titleLabel.height + 32, this.container.width / 2, "grow");

        this.container.addChild(growingContainer, "Top", "Left");

        const turnsUntilDeadLabel = new TextLabel(scene, 0, 4, "Turns to die: ");
        growingContainer.addChild(turnsUntilDeadLabel);

        const turnsUntilGrownLabel = new TextLabel(scene, 0, 4, "Turns to grow: ");
        growingContainer.addChild(turnsUntilGrownLabel);

        const seedProductionRateLabel = new TextLabel(scene, 0, 4, "Seed production: ");
        growingContainer.addChild(seedProductionRateLabel);
        
        const tenacityLabel = new TextLabel(scene, 0, 4, "Tenacity: ");
        growingContainer.addChild(tenacityLabel);
                
        const flowerStatsDisplay = new FlowerStatsDisplay(scene, 8, 32, 350, 16);
        growingContainer.addChild(flowerStatsDisplay);

        flowerSelectionController.selectedFlowerTypeObservable().pipe(
            filter(type => type != null),
            map(type => type!),
            withLatestFrom(gameStateController.gameStateObservable()),
            map(([type, gameState]) => gameState.flowerTypes[type])
        ).subscribe(flowerTypeStats => {
            const { 
                turnsUntilDead, turnsUntilGrown, seedProductionRate, name, tenacity
            } = flowerTypeStats;

            this.titleLabel.setText(name);
            turnsUntilDeadLabel.setText("Turns to die: " + turnsUntilDead);
            turnsUntilGrownLabel.setText("Turns to grow: " + turnsUntilGrown);
            seedProductionRateLabel.setText("Seed production: " + seedProductionRate);
            tenacityLabel.setText("Tenacity: " + tenacity + "%");
            flowerStatsDisplay.setValues(flowerTypeStats);
        })
    }
}