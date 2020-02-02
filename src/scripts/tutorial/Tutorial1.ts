import { TutorialBase } from "./TutorialBase";
import { GameState } from "../objects/GameState";
import { TutorialRunnerCallbacks } from "./TutorialRunner";

export class Tutorial1 extends TutorialBase {
    
    startGame(gameState: GameState, callbacks: TutorialRunnerCallbacks): void {
        callbacks.showTips([
            {
                title: this.title,
                content: "You've been given one starting flower in the bottom left tile of the map.",
                position: { x: 300, y: 250 }
            },
            {
                title: this.title,
                content: "This flower takes 2 turns to completely grow. Click end turn to start growing it.",
                position: { x: 860, y: 516 }
            }
        ]);
        callbacks.focusTile(gameState.getTileAt(gameState.flowersMap["0"].x, gameState.flowersMap["0"].y)!);
    }

    constructor() {
        super("Growth & Expansion");

        this.addEvent(
            1, 
            (gameState: GameState) => Object.keys(gameState.flowersMap)
                .map(flowerKey => gameState.flowersMap[flowerKey])
                .some(
                    flower => flower.growth >= gameState.getFlowerType(flower).turnsUntilGrown
                ),
            (callbacks: TutorialRunnerCallbacks) => {
                callbacks.showTips([
                    {
                        title: this.title,
                        content: "Great! Your flower is now fully grown.",
                        position: { x: 300, y: 250 }
                    },
                    {
                        title: this.title,
                        content: "Fully grown flowers will start producing seeds. Click 'end turn' a few more times until you get your first seed.",
                        position: { x: 860, y: 516 }
                    }
                ])
            }
        );

        this.addEvent(
            1,
            (gameState: GameState) => Object.keys(gameState.seedStatus).some(key => gameState.seedStatus[key].quantity > 0),
            (callbacks: TutorialRunnerCallbacks) => {
                callbacks.showTips([
                    {
                        title: this.title,
                        content: "A seed has been produced by your flower. Click the '+' button to open seed placement mode",
                        position: { x: 800, y: 516 }
                    },
                    {
                        title: this.title,
                        content: "Click a tile on the map and then end your turn to create a new flower. This will produce a flower of the same type with growth set to 0",
                        position: undefined
                    },
                    {
                        title: this.title,
                        content: "You can only plant seeds on tiles adjacent to flowers you own.",
                        position: undefined
                    }
                ])
            }
        );

        this.addEvent(
            1,
            (gameState: GameState) => Object.keys(gameState.flowersMap).length == 5,
            (callbacks: TutorialRunnerCallbacks) => {
                callbacks.showTips([
                    {
                        title: this.title,
                        content: "When placing seeds, some tiles have little stars in them. This means that the soil meets the requirements of that flower type.",
                        position: { x: 300, y: 250 }
                    },
                    {
                        title: this.title,
                        content: "If a flower doesn't meet the requirements it has a chance to die every turn. This chance is determined by the flower's tenacity attribute.",
                        position: undefined
                    },
                    {
                        title: this.title,
                        content: "Expand your flowers to the topmost point in the map to complete the tutorial.",
                        position: undefined
                    }
                ])
            }
        );

        this.addEvent(
            1,
            (gameState: GameState) => Object.keys(gameState.flowersMap).some(flowerKey => gameState.flowersMap[flowerKey].y == 0),
            (callbacks: TutorialRunnerCallbacks) => {
                callbacks.victory();
            }
        );
    }
}