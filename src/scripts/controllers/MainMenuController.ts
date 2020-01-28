import { Subject, Observable, ReplaySubject } from "rxjs";

export type LoadState = "LOADING_GAME_ASSETS" | "LOADING_MAP_DATA" | "FINISHED";
export type MainMenuScreen = "MAIN_MENU" | "LEVEL_SELECT";

export class MainMenuController {
    private onFinishedLoadingGameAssets$: Subject<void>;
    private loadState$: Subject<LoadState>;
    private loadLevel$: Subject<string>;
    private activeMenuScreen$: Subject<MainMenuScreen>;

    constructor() {
        this.onFinishedLoadingGameAssets$ = new ReplaySubject(1);
        this.loadState$ = new ReplaySubject(1);
        this.loadLevel$ = new Subject();
        this.activeMenuScreen$ = new ReplaySubject(1);
    }
    
    setFinishedLoadingGameAssets() {
        this.onFinishedLoadingGameAssets$.next();
    }

    setLoadState(loadState: LoadState) {
        this.loadState$.next(loadState);
    }

    setActiveMenuScreen(mainMenuScreen: MainMenuScreen) {
        this.activeMenuScreen$.next(mainMenuScreen);
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
    
    activeMenuScreenObservable(): Observable<MainMenuScreen> {
        return this.activeMenuScreen$;
    }
}