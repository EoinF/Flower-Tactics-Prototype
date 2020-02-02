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
                        content: "Notice the enemy flower has begun flashing. It has reached its growth limit and now has a chance to die every turn.",
                        position: { x: 348, y: 250 },
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
                        content: "The enemy flower died. Now's your chance to claim that spot!",
                        position: { x: 348, y: 250 }
                    },
                    {
                        title: this.title,
                        content: "You can now plant a seed on this tile, but beware, the opponent can also plant seeds of their own.",
                        position: undefined
                    },
                    {
                        title: this.title,
                        content: "Whoever has more seeds on a tile gets a flower on that tile. The other player's seeds are lost.",
                        position: undefined
                    },
                    {
                        title: this.title,
                        content: "Plant 2 seeds on the tile to challenge your opponent on that tile.",
                        position: undefined
                    }
                ])
            }
        );
        
        this.addEvent(
            1,
            (gameState, playerId) => (
                gameState.players[playerId].flowers.length > 1
            ),
            (callbacks, gameState) => {
                callbacks.showTips([
                    {
                        title: this.title,
                        content: "Good job! Now expand your flowers onto the river tile to finish the tutorial.",
                        position: { x: 348, y: 250 }
                    }
                ]);
                const river = gameState.rivers[0];
                callbacks.focusTile(gameState.getTileAt(river.x, river.y)!);
            }
        );

        this.addEvent(
            1,
            (gameState, playerId) => (Object.keys(gameState.flowersMap)
                .some(flowerKey => 
                    gameState.players[playerId].seedsOwned.indexOf(gameState.flowersMap[flowerKey].type) !== -1 &&
                    gameState.rivers[0].x === gameState.flowersMap[flowerKey].x &&
                    gameState.rivers[0].y === gameState.flowersMap[flowerKey].y
                )
            ),
            (callbacks: TutorialRunnerCallbacks) => {
                callbacks.victory();
            }
        );
    }
}