import { Subject, ReplaySubject, BehaviorSubject, Observable } from "rxjs";

export class SelectedTileController {
    private activeTile$: Subject<{x: number, y: number} | null>;
    private activeTab$: Subject<number>;

    constructor() {
        this.activeTile$ = new BehaviorSubject<{x: number, y: number} | null>(null);
        this.activeTab$ = new BehaviorSubject(0);
    }

    activeTileObservable(): Observable<{x: number, y: number} | null> {
        return this.activeTile$;
    }

    activeTabObservable(): Observable<number> {
        return this.activeTab$;
    }

    setActiveTile(x: number, y: number) {
        this.activeTile$.next({x, y})
    }
    
    setActiveTabIndex(index: number) {
        this.activeTab$.next(index);
    }
}
