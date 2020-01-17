import { GameState, GameStateData } from "../objects/GameState";
import { Subject, Observable, ReplaySubject } from "rxjs";

export class GameStateController {
    private gameState$: Subject<GameState>;
    private currentPlayer$: ReplaySubject<string>;
    private loadMap$: Subject<GameState>;

    constructor() {
        this.gameState$ = new ReplaySubject(1);
        this.currentPlayer$ = new ReplaySubject(1);
        this.loadMap$ = new ReplaySubject(1);
    }

    setState(state: GameState) {
        this.gameState$.next(state);
    }

    loadGame(gameStateOrData: GameState | GameStateData) {
        let gameState: GameState;
        if (gameStateOrData instanceof GameState) {
            gameState = gameStateOrData;
        } else {
            gameState = new GameState(gameStateOrData);
        }
        
        this.gameState$.next(gameState);
        this.currentPlayer$.next(Object.keys(gameState.players)[0]);
        this.loadMap$.next(gameState);
    }

    gameStateObservable(): Observable<GameState> {
        return this.gameState$;
    }
    
    currentPlayerObservable(): Observable<string> {
        return this.currentPlayer$;
    }

    loadMapObservable(): Observable<GameState> {
        return this.loadMap$;
    }
}