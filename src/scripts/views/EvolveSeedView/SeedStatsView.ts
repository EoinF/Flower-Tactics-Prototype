import { withLatestFrom, map, filter } from "rxjs/operators";
import { GameStateManager } from "../../controllers/GameStateManager";
import { BaseUIObject } from "../../widgets/generic/UIObject";
import { COLOURS } from "../../constants";
import { TextLabel } from "../../widgets/generic/TextLabel";
import { FlexUIContainer } from "../../widgets/generic/FlexUIContainer";
import { EvolveSeedController } from "../../controllers/EvolveSeedController";
import { FlowerStatsDisplay } from "../../widgets/specific/FlowerStatsDisplay";

export class SeedStatsView extends BaseUIObject {
    titleLabel: TextLabel;
    
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number,
        gameStateManager: GameStateManager, evolveSeedController: EvolveSeedController
    ) {
        super(scene, x, y, width, height);
        this.container.setBackground(COLOURS.PURPLE_200)
            .setBorder(1, COLOURS.BLACK)

        this.titleLabel = new TextLabel(scene, 0, 8, "Flower Title", COLOURS.BLACK, {isBold: true, fontSize: 18}),
        this.container.addChild(this.titleLabel, "Top", "Middle");

        const growingContainer = new FlexUIContainer(scene, 16, this.titleLabel.height + 32, this.container.width / 2, "grow");

        this.container.addChild(growingContainer, "Top", "Left");

        const soilConsumptionLabel = new TextLabel(scene, 0, 4, "Soil Consumption: ");
        growingContainer.addChild(soilConsumptionLabel);

        const turnsUntilGrownLabel = new TextLabel(scene, 0, 4, "Turns to grow: ");
        growingContainer.addChild(turnsUntilGrownLabel);

        const seedProductionRateLabel = new TextLabel(scene, 0, 4, "Seed production: ");
        growingContainer.addChild(seedProductionRateLabel);
                
        const flowerStatsDisplay = new FlowerStatsDisplay(scene, 8, 32, 350, 16);
        growingContainer.addChild(flowerStatsDisplay);

        evolveSeedController.selectedFlowerTypeObservable().pipe(
            filter(type => type != null),
            map(type => type!),
            withLatestFrom(gameStateManager.nextStateObservable()),
            map(([type, gameState]) => gameState.flowerTypes[type])
        ).subscribe(flowerTypeStats => {
            const { 
                soilConsumptionRate, turnsUntilGrown, seedProductionRate, name
            } = flowerTypeStats;

            this.titleLabel.setText(name);
            soilConsumptionLabel.setText("Soil Consumption: " + soilConsumptionRate);
            turnsUntilGrownLabel.setText("Turns to grow: " + turnsUntilGrown);
            seedProductionRateLabel.setText("Seed production: " + seedProductionRate);
            flowerStatsDisplay.setValues(flowerTypeStats);
        })
    }
}