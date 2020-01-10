import { Subject, Observable, ReplaySubject } from "rxjs";
import { GameStateDelta } from "../objects/GameStateDelta";

export class GameDeltaController {

    private gameDelta$: Subject<GameStateDelta>;

    constructor() {
        this.gameDelta$ = new ReplaySubject(1);
    }

    setDelta(gameDelta: GameStateDelta) {
        this.gameDelta$.next(gameDelta);
    }
    
    gameDeltaObservable(): Observable<GameStateDelta> {
        return this.gameDelta$;
    }
}