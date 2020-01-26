import { GameState, GameStateData } from "../objects/GameState";
import { Subject, Observable, ReplaySubject, merge } from "rxjs";
import { GameStateDelta } from "../objects/GameStateDelta";
import { scan, filter, map, shareReplay } from "rxjs/operators";
import { applyDeltas } from "../connectors/gameStateConnectors";

export class GameStateController {
    private gameState$: Subject<GameState>;
    private currentPlayer$: ReplaySubject<string>;
    private loadMap$: Subject<GameState>;
    private applyDelta$: Subject<GameStateDelta>;
    private currentGameState$: Observable<GameState | null>;

    constructor() {
        this.gameState$ = new ReplaySubject(1);
        this.currentPlayer$ = new ReplaySubject(1);
        this.loadMap$ = new ReplaySubject(1);
        this.currentGameState$ = new ReplaySubject(1);
        this.applyDelta$ = new Subject();

        this.currentGameState$ = merge(
            this.gameState$,
            this.applyDelta$
        ).pipe(
            scan<GameState | GameStateDelta, GameState | null>((currentGameState, deltaOrReset) => {
                if (deltaOrReset instanceof GameState) {
                    return deltaOrReset;
                } else if (currentGameState == null) {
                    throw Error("Game state must be set before applying a delta");
                } else {
                    return new GameState(applyDeltas(getCopiedState(currentGameState), deltaOrReset), currentGameState.turnCounter + 1)
                }
            }, null)
        )
    }

    setState(state: GameState) {
        this.gameState$.next(state);
    }

    applyDelta(delta: GameStateDelta) {
        this.applyDelta$.next(delta);
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
        return this.currentGameState$.pipe(
            filter(state => state != null),
            map(state => state!)
        );
    }
    
    currentPlayerObservable(): Observable<string> {
        return this.currentPlayer$;
    }

    loadMapObservable(): Observable<GameState> {
        return this.loadMap$;
    }
}

function getCopiedState(gameState: GameState): GameStateData {
    const nextRandomNumberSeed = gameState!.getRandomNumberSeed();
    const copiedData = JSON.parse(JSON.stringify(gameState)) as GameStateData;
    return {
        ...copiedData, randomNumberGeneratorSeed: nextRandomNumberSeed
    };
}