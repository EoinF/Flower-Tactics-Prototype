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
                randomNumberGeneratorSeed: gameState.randomNumberGeneratorSeed
            } as GameStateData
        } else {
            data = gameState
        }
        this.save(data);
    }

    save(data: GameStateData) {
        document.getElementById("map-data-text")!.innerText = JSON.stringify(data);
    }
}