import { Subject, merge, Observable, ReplaySubject } from "rxjs";
import { GameStateData, GameState } from "../objects/GameState";
import { map, scan, tap, shareReplay } from "rxjs/operators";

export interface SavedGameData {
    date: string;
    id: string;
    state: GameStateData;
    mapName: string;
}

export class SavedGameController {
    private resetSavedGames$: Subject<SavedGameData[]>;
    private saveGame$: Subject<GameState>;
    private savedGames$: Observable<SavedGameData[]>;
    
    constructor() {
        this.resetSavedGames$ = new ReplaySubject(1);
        this.saveGame$ = new Subject();

        this.savedGames$ = merge(
            this.resetSavedGames$.pipe(
                map((data) => ({ type: 'RESET', data}))
            ),
            this.saveGame$.pipe(
                map(gameState => this.getGameStateData(gameState)),
                map((data) => ({ type: 'SAVE', data}))
            )
        ).pipe(
            scan<any, SavedGameData[]>((savedGames, dataOrReset) => {
                if (dataOrReset.type === 'RESET') {
                    return dataOrReset.data as SavedGameData[];
                } else {
                    const data = dataOrReset.data as GameStateData;
                
                    const saveData: SavedGameData = {
                        date: new Date().toLocaleString(),
                        id: data.gameId!,
                        state: data,
                        mapName: data.mapName
                    };
                    const existingSaveIndex = savedGames.findIndex(savedGame => savedGame.id === saveData.id);
                    if (existingSaveIndex !== -1) {
                        savedGames[existingSaveIndex] = saveData;
                    } else {
                        if (savedGames.length >= 3) {
                            savedGames.pop();
                        }
                        savedGames.unshift(saveData);
                    }
                    return savedGames;
                }
            }, []),
            tap((savedGames) => {
                localStorage.setItem("SavedGames", JSON.stringify(savedGames));
            }),
            shareReplay(1)
        )
    }

    setSavedGames(savedGames: SavedGameData[]) {
        this.resetSavedGames$.next(savedGames);
    }

    saveGame(gameState: GameState) {
        this.saveGame$.next(gameState);
    }

    savedGamesObservable() {
        return this.savedGames$;
    }

    
    private getGameStateData(gameState: GameState): GameStateData {
        return {
            mapName: gameState.mapName,
            numTilesX: gameState.numTilesX,
            numTilesY: gameState.numTilesY,
            flowerTypes: gameState.flowerTypes,
            flowersMap: gameState.flowersMap,
            mountains: gameState.mountains,
            rivers: gameState.rivers,
            seedStatus: gameState.seedStatus,
            players: gameState.players,
            tiles: gameState.tiles,
            randomNumberGeneratorSeed: gameState.getRandomNumberSeed(),
            gameId: gameState.gameId,
            clouds: gameState.clouds,
            flowerAugmentations: gameState.flowerAugmentations
        };
    }
}