import { GuiController } from "../controllers/GuiController";
import { GameStateManager } from "../GameStateManager";
import { UIContainer } from "../widgets/UIContainer";
import { TextButton } from "../widgets/TextButton";

export class GuiView {
    gameStateManager: GameStateManager;

    seedAmountText: Phaser.GameObjects.Text;
    seedDeltaText: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, gameStateManager: GameStateManager, controller: GuiController) {
        this.gameStateManager = gameStateManager;
        const {
            width, height
        } = scene.game.canvas;

        const endTurnButton = new TextButton(scene, 10, 10, 98, 24, "End Turn", "Bottom", "Right");
        endTurnButton.onClick(() => this.gameStateManager.nextState());

        const seedContainer = new UIContainer(scene, 8, 8, 108, 24)
            .setBackgroundColour(0xffffff);

        const seedSprite = new Phaser.GameObjects.Sprite(scene, 4, 4, "seed")
            .setOrigin(0, 0);
        this.seedAmountText = new Phaser.GameObjects.Text(scene, 24, 4, "",
            {
                color: "#000",
                fontStyle: "bold"
            }
        );
        this.seedDeltaText = new Phaser.GameObjects.Text(scene, 52, 4, "(+1)",
            {
                color: "#090",
                fontStyle: "bold",
                fontSize: "16px"
            }
        ).setFixedSize(48, 0);

        seedContainer.addChild(seedSprite);
        seedContainer.addChild(this.seedAmountText);
        seedContainer.addChild(this.seedDeltaText);

        gameStateManager.onChange(() => {
            this.setSeedAmountText();
        });
        this.setSeedAmountText();
    }

    setSeedAmountText() {
        let amount = Object.keys(this.gameStateManager.gameState.seedsOwned)
                .map(key => this.gameStateManager.gameState.seedsOwned[key])
                .reduce((previousValue, currentValue) => {
                    return currentValue + previousValue;
                }, 0)
                .toString();
        amount = "   " + amount;
        amount = amount.slice(amount.length - 3, amount.length);
        this.seedAmountText.setText(amount);
    }
}