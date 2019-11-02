import { GuiController } from "../controllers/GuiController";
import { GameStateManager } from "../GameStateManager";
import { UIContainer } from "../widgets/UIContainer";
import { TextButton } from "../widgets/TextButton";

const COLOUR_RED = "#d00";
const COLOUR_GREEN = "#090";
const COLOUR_NEUTRAL = "#555";

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
        this.seedDeltaText = new Phaser.GameObjects.Text(scene, 52, 4, "",
            {
                color: COLOUR_GREEN,
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
        let amount = Object.keys(this.gameStateManager.gameState.seedStatus)
                .map(key => this.gameStateManager.gameState.seedStatus[key].quantity)
                .reduce((previousValue, currentValue) => {
                    return currentValue + previousValue;
                }, 0)
                .toString();
        amount = "   " + amount;
        amount = amount.slice(amount.length - 3, amount.length);
        this.seedAmountText.setText(amount);
        let delta = Object.keys(this.gameStateManager.gameStateDelta.seedStatusDelta)
            .map(key => {
                const seedDelta = this.gameStateManager.gameStateDelta.seedStatusDelta[key];
                const deltaProgress = seedDelta.quantity * 100 + seedDelta.progress;
                console.log(this.gameStateManager.gameState.seedStatus[key].progress + deltaProgress)
                return this.gameStateManager.gameState.seedStatus[key].progress + deltaProgress;
            })
            .map(progress => Math.floor(progress / 100))
            .reduce((previousValue, currentValue) => {
                return currentValue + previousValue;
            }, 0)
        
        const sign = delta < 0 ? '-': '+';
        this.seedDeltaText.setText(`(${sign}${delta.toString()})`);
        if (delta == 0) {
            this.seedDeltaText.setColor(COLOUR_NEUTRAL);
        } else if (delta < 0) {
            this.seedDeltaText.setColor(COLOUR_RED);
        } else {
            this.seedDeltaText.setColor(COLOUR_GREEN);
        }
    }
}