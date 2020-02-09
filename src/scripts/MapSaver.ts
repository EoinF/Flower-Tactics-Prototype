import { GameState, GameStateData } from "./objects/GameState";
import uuidv4 from 'uuid/v4';

interface SavedGameData {
    date: Date;
    id: string;
    state: GameStateData;
}

export class MapSaver {
    private savedGames: SavedGameData[];
    constructor() {
        this.savedGames = JSON.parse(localStorage.getItem("SavedGames") || "[]") as SavedGameData[];
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

    private save(state: GameStateData) {
        const saveData: SavedGameData = {
            date: new Date(),
            id: uuidv4(),
            state
        };
        this.savedGames.push(saveData);
        localStorage.setItem("SavedGames", JSON.stringify(this.savedGames));
    }
}