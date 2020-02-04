import { GameState, GameStateData } from "./objects/GameState";

export class MapSaver {
    constructor() {

    }

    saveMap(gameState: GameState | GameStateData) {
        let data: GameStateData;
        if (gameState instanceof GameState) {
            data = {
                numTilesX: gameState.numTilesX,
                numTilesY: gameState.numTilesY,
                flowerTypes: gameState.flowerTypes,
                flowersMap: gameState.flowersMap,
                mountains: gameState.mountains,
                rivers: gameState.rivers,
                seedStatus: gameState.seedStatus,
                players: gameState.players,
                tiles: gameState.tiles,
                randomNumberGeneratorSeed: gameState.getRandomNumberSeed()
            } as GameStateData
        } else {
            data = gameState
        }
        this.save(data);
    }

    private save(data: GameStateData) {
        const element = document.getElementById("map-data-text")!;
        element.innerText = JSON.stringify(data);
        element.style.display = "block";
    }
}