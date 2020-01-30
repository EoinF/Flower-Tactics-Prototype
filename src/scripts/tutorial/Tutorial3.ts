import { TutorialBase } from "./TutorialBase";
import { GameState } from "../objects/GameState";
import { TutorialRunnerCallbacks } from "./TutorialRunner";

export class Tutorial3 extends TutorialBase {
    
    startGame(gameState: GameState, callbacks: TutorialRunnerCallbacks): void {
        callbacks.showTips([
            {
                title: this.title,
                content: "Expanding your flowers only goes so far. You will quickly run out of space.",
                position: { x: 300, y: 250 },
            },
            {
                title: this.title,
                content: "You need to compete for tiles in order to expand, or to claim valuable resources. Click end turn to continue.",
                position: undefined
            }
        ]);
        callbacks.focusTile(gameState.getTileAt(gameState.flowersMap["0"].x, gameState.flowersMap["0"].y)!);
    }

    constructor() {
        super("Compete and Conquer");

        this.addEvent(
            1,
            (gameState) => {
                const enemyFlower = gameState.flowersMap["1"]!;
                const enemyFlowerType = gameState.getFlowerType(enemyFlower);
                return enemyFlower.growth >= enemyFlowerType.turnsUntilGrown + enemyFlowerType.turnsUntilDead;
            },
            (callbacks: TutorialRunnerCallbacks, gameState: GameState) => {
                callbacks.showTips([
                    {
                        title: this.title,
                        content: "Notice the enemy flower has begun flashing. This means it's dying",
                        position: { x: 300, y: 250 },
                        delay: 1000
                    }
                ])
                const enemyFlower = gameState.flowersMap["1"]!;
                callbacks.focusTile(gameState.getTileAt(enemyFlower.x, enemyFlower.y)!);
            }
        );

        this.addEvent(
            1,
            (gameState) => (
                Object.keys(gameState.flowersMap).indexOf("1") === -1
            ),
            (callbacks: TutorialRunnerCallbacks) => {
                callbacks.showTips([
                    {
                        title: this.title,
                        content: "The enemy flower is now dead. Now's your chance!",
                        position: { x: 300, y: 250 }
                    },
                    {
                        title: this.title,
                        content: "You can now plant a seed on this tile, but beware, the opponent can also place a seed.",
                        position: { x: 300, y: 250 }
                    },
                    {
                        title: this.title,
                        content: "Whoever has more seeds on a tile gets a flower on that tile. The other players seeds are wasted.",
                        position: { x: 300, y: 250 }
                    },
                    {
                        title: this.title,
                        content: "Place 2 seeds on the tile to challenge your opponent on that tile.",
                        position: { x: 300, y: 250 }
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