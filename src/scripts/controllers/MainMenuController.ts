import { Subject, Observable, ReplaySubject } from "rxjs";

export type LoadState = "LOADING_GAME_ASSETS" | "LOADING_MAP_DATA" | "FINISHED"; 

export class MainMenuController {
    private onFinishedLoadingGameAssets$: Subject<void>;
    private loadState$: Subject<LoadState>;
    private loadLevel$: Subject<string>;
    
    constructor() {
        this.onFinishedLoadingGameAssets$ = new ReplaySubject(1);
        this.loadState$ = new ReplaySubject(1);
        this.loadLevel$ = new Subject();
    }
    
    setFinishedLoadingGameAssets() {
        this.onFinishedLoadingGameAssets$.next();
    }

    setLoadState(loadState: LoadState) {
        this.loadState$.next(loadState);
    }

    loadLevel(levelName: string) {
        this.loadLevel$.next(levelName);
    }

    onFinishedLoadingGameAssetsObservable(): Observable<void> {
        return this.onFinishedLoadingGameAssets$;
    }

    loadLevelObservable(): Observable<string> {
        return this.loadLevel$;
    }

    loadStateObservable(): Observable<LoadState> {
        return this.loadState$;
    }
}