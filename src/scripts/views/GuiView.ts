import { GuiController } from "../controllers/GuiController";
import { GameStateManager } from "../GameStateManager";
import { UIContainer } from "../widgets/UIContainer";
import { TextButton } from "../widgets/TextButton";
import { COLOURS } from "../widgets/constants";

export class GuiView {
    gameStateManager: GameStateManager;

    seedAmountText: Phaser.GameObjects.Text;
    seedDeltaText: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, gameStateManager: GameStateManager, controller: GuiController) {
        this.gameStateManager = gameStateManager;
        const {
            width, height
        } = scene.game.canvas;

        const endTurnButton = new TextButton(scene, 10, 10, 98, 24, "End Turn", COLOURS.WHITE, COLOURS.LIGHT_GRAY, "Bottom", "Right")
            .setBorder(1, COLOURS.PURPLE_500)
            .onClick(() => this.gameStateManager.nextState());

        const seedContainer = new UIContainer(scene, 8, 8, 108, 24)
            .setBackground(0xffffff)
            .setBorder(1, 0x0);

        const seedSprite = scene.add.sprite(4, 4, "seed")
            .setOrigin(0, 0);
        this.seedAmountText = scene.add.text(24, 4, "",
            {
                color: "#000",
                fontStyle: "bold"
            }
        ).setDepth(2);
        this.seedDeltaText = scene.add.text(52, 4, "",
            {
                color: COLOURS.GREEN.rgba,
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
                return this.gameStateManager.gameState.seedStatus[key].progress + deltaProgress;
            })
            .map(progress => Math.floor(progress / 100))
            .reduce((previousValue, currentValue) => {
                return currentValue + previousValue;
            }, 0)
        
        const sign = delta < 0 ? '-': '+';
        this.seedDeltaText.setText(`(${sign}${delta.toString()})`);
        if (delta == 0) {
            this.seedDeltaText.setColor(COLOURS.BLACK.rgba);
        } else if (delta < 0) {
            this.seedDeltaText.setColor(COLOURS.RED.rgba);
        } else {
            this.seedDeltaText.setColor(COLOURS.GREEN.rgba);
        }
    }
}