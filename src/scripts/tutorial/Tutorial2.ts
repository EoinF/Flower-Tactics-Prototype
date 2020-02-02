import { TutorialBase } from "./TutorialBase";
import { GameState } from "../objects/GameState";
import { TutorialRunnerCallbacks } from "./TutorialRunner";

export class Tutorial2 extends TutorialBase {
    
    startGame(gameState: GameState, callbacks: TutorialRunnerCallbacks): void {
        callbacks.showTips([
            {
                title: this.title,
                content: "In this tutorial you'll learn how to evolve your existing seeds so they can cover varying soil types.",
                position: { x: 300, y: 250 }
            },
            {
                title: this.title,
                content: "To evolve you need to save up lots of seeds. The more the better. Click end turn a few times to collect more seeds",
                position: undefined
            }
        ]);
        callbacks.focusTile(gameState.getTileAt(gameState.flowersMap["0"].x, gameState.flowersMap["0"].y)!);
    }

    constructor() {
        super("Evolve & Adapt");

        this.addEvent(
            1,
            (gameState: GameState, playerId: string) => gameState.players[playerId].seedsOwned.some(seedType => 
                gameState.seedStatus[seedType].quantity >= 10
            ),
            (callbacks: TutorialRunnerCallbacks) => {
                callbacks.showTips([
                    {
                        title: this.title,
                        content: "Click the ^ button to open the seed evolution screen",
                        position: { x: 798, y: 508 }
                    }
                ])
            }
        );

        this.addEvent(
            1,
            (gameState, playerId, isEvolveScreenOpen) => (
                isEvolveScreenOpen &&
                gameState.players[playerId].seedsOwned.some(seedType => 
                    gameState.seedStatus[seedType].quantity >= 10
                )
            ),
            (callbacks) => {
                callbacks.showTips([
                    {
                        title: this.title,
                        content: "On the left side of this screen is your seed inventory.",
                        position: { x: 80, y: 112 }
                    },
                    {
                        title: this.title,
                        content: "The stats of the currently selected flower are shown on the top right.",
                        position: { x: 470, y: 78 }
                    },
                    {
                        title: this.title,
                        content: "And the details of seeds staged for evolution are in the bottom right of this screen. ",
                        position: { x: 470, y: 320 }
                    },
                    {
                        title: this.title,
                        content: "Clicking the > button on a seed in your inventory will stage the seed for evolution."
                            + "\nNote: You can only stage one type of seed at a time",
                        position: undefined
                    }
                ]);
            }
        );

        
        this.addEvent(
            1,
            (gameState, playerId, isEvolveScreenOpen, stagedSeed) => (
                isEvolveScreenOpen &&
                gameState.players[playerId].seedsOwned.some(seedType => 
                    gameState.seedStatus[seedType].quantity >= 10
                ) && stagedSeed != null && gameState.players[playerId].seedsOwned.some(seedType =>
                    stagedSeed.type === seedType && stagedSeed.stagedAmount > 0
                )
            ),
            (callbacks) => {
                callbacks.showTips([
                    {
                        title: this.title,
                        content: "The odds of success are shown on the right. Click on > again to stage more seeds. This will improve the chances of a successful evolution.",
                        position: { x: 470, y: 320 }
                    }
                ]);
            }
        )
        
        this.addEvent(
            1,
            (gameState, playerId, isEvolveScreenOpen, stagedSeed) => (
                isEvolveScreenOpen &&
                gameState.players[playerId].seedsOwned.some(seedType => 
                    gameState.seedStatus[seedType].quantity >= 10
                ) && stagedSeed != null && gameState.players[playerId].seedsOwned.some(seedType =>
                    stagedSeed.type === seedType && stagedSeed.stagedAmount > 1
                )
            ),
            (callbacks) => {
                callbacks.showTips([
                    {
                        title: this.title,
                        content: "Not only does this improve the chances of success, but it also produces better results.",
                        position: { x: 470, y: 320 }
                    },
                    {
                        title: this.title,
                        content: "It's always more efficient to use more seeds, but the downside is having the seeds sitting idle in"
                        + " your inventory until you have enough.",
                        position: undefined
                    },
                    {
                        title: this.title,
                        content: "Click the evolve button to commit the staged seeds and see the outcome of the evolution.",
                        position: undefined
                    }
                ]);
            }
        );
        
        this.addEvent(
            1,
            (gameState, playerId, isEvolveScreenOpen) => (
                isEvolveScreenOpen &&
                gameState.players[playerId].seedsOwned.length > 1
            ),
            (callbacks) => {
                callbacks.showTips([
                    {
                        title: this.title,
                        content: "You now have a new seed with improved stats. Place it on the map to start producing seeds of that same type.",
                        position: { x: 470, y: 320 }
                    }
                ]);
            }
        );
        
        this.addEvent(
            1,
            (gameState, playerId) => (
                gameState.players[playerId].seedsOwned.length > 1 &&
                gameState.players[playerId].seedsOwned.every(seedKey => 
                    Object.keys(gameState.flowersMap).some(flowerKey => 
                        gameState.flowersMap[flowerKey].type === seedKey
                    )
                )
            ),
            (callbacks) => {
                callbacks.showTips([
                    {
                        title: this.title,
                        content: "There are other ways to produce seeds faster apart from evolving, like having access to a water source",
                        position: { x: 470, y: 320 }
                    },
                    {
                        title: this.title,
                        content: "You have the ability to place a cloud anywhere on the map. This will provide a water source to that tile.",
                        position: { x: 670, y: 420 }
                    },
                    {
                        title: this.title,
                        content: "Tiles with a water source grow flowers twice as fast and produce seeds twice as fast.",
                        position: undefined
                    },
                    {
                        title: this.title,
                        content: "There are other water sources to be found as well, like rivers. However, the effect"
                            + " doesn't stack!",
                        position: undefined
                    },
                    {
                        title: this.title,
                        content: "Place the cloud on one of your flowers to complete the tutorial",
                        position: undefined
                    }
                ]);
                callbacks.giftCloudToPlayer();
            }
        );

        this.addEvent(
            1,
            (gameState: GameState) => Object.keys(gameState.clouds)
                .map(cloudKey => gameState.tiles[gameState.clouds[cloudKey].tileIndex])
                .some(tileIndex => gameState.getFlowerAtTile(tileIndex) != null
            ),
            (callbacks: TutorialRunnerCallbacks) => {
                callbacks.victory();
            }
        );
    }
}