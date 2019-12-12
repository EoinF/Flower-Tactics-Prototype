import { TutorialBase } from "./TutorialBase";
import { GameState } from "../objects/GameState";
import { TutorialRunnerCallbacks } from "./TutorialRunner";

export class Tutorial1 extends TutorialBase {
    constructor() {
        super("Growth & Expansion");

        this.addEvent(
            1, 
            (gameState: GameState) => {
                console.log("test", gameState.flowers[0], gameState.getFlowerType(gameState.flowers[0]).turnsUntilGrown)
                return gameState.flowers.some(
                    flower => flower.growth >= gameState.getFlowerType(flower).turnsUntilGrown)
            },
            (callbacks: TutorialRunnerCallbacks) => {
                callbacks.showTips(this.title, [
                    "Great! Your flower is now fully grown.",
                    "Fully grown flowers will start producing seeds. Click 'end turn' a few more times until you get your first seed"
                ])
            }
        );
    }

    startGame(gameState: GameState, callbacks: TutorialRunnerCallbacks): void {
        callbacks.showTips(this.title, [
            "You've been given one starting flower in the bottom left tile of the map",
            "This flower takes 2 turns to be fully grown. Click the 'end turn' button twice"
        ]);
    }
}