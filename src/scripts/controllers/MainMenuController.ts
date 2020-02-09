import { Subject, Observable, ReplaySubject } from "rxjs";
import { PlayerType } from '../objects/Player';

export type LoadState = "LOADING_GAME_ASSETS" | "LOADING_MAP_DATA" | "FINISHED";
export type MainMenuScreen = "MAIN_MENU" | "NEW_GAME" | "TUTORIAL_SELECT";

interface ExtraLevelConfig {
    player1?: PlayerType,
    player2?: PlayerType
}

export type LevelConfig = {
    mapName: string,
} & ExtraLevelConfig;

export class MainMenuController {
    private onFinishedLoadingGameAssets$: Subject<void>;
    private loadState$: Subject<LoadState>;
    private loadLevel$: Subject<LevelConfig>;
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

    loadLevel(mapName: string, levelConfig: ExtraLevelConfig = {}) {
        this.loadLevel$.next({ mapName, ...levelConfig });
    }

    onFinishedLoadingGameAssetsObservable(): Observable<void> {
        return this.onFinishedLoadingGameAssets$;
    }

    loadLevelObservable(): Observable<LevelConfig> {
        return this.loadLevel$;
    }

    loadStateObservable(): Observable<LoadState> {
        return this.loadState$;
    }
    
    activeMenuScreenObservable(): Observable<MainMenuScreen> {
        return this.activeMenuScreen$;
    }
}