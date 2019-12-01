import { Subject, BehaviorSubject, Observable, combineLatest, merge } from "rxjs";
import { mergeAll, mapTo, startWith } from "rxjs/operators";
import { MapLocation } from "./MapController";

export class SelectedObjectController {
    private selectedTile$: Subject<MapLocation>;
    private selectedFlowerType$: Subject<string>;
    private activeTab$: Subject<number>;

    constructor() {
        this.selectedTile$ = new Subject<MapLocation>();
        this.selectedFlowerType$ = new Subject<string>();
        this.activeTab$ = new BehaviorSubject(0);
    }

    selectedTileObservable(): Observable<MapLocation | null> {
        return merge(
            this.selectedTile$,
            this.selectedFlowerType$.pipe(mapTo(null))
        ).pipe(
            startWith(null)
        );
    }
    
    selectedFlowerTypeObservable(): Observable<string | null> {
        return merge(
            this.selectedTile$.pipe(mapTo(null)),
            this.selectedFlowerType$
        ).pipe(
            startWith(null)
        );
    }

    activeTabObservable(): Observable<number> {
        return this.activeTab$;
    }

    setSelectedTile(x: number, y: number) {
        this.selectedTile$.next({x, y});
    }

    setSelectedFlowerType(type: string) {
        this.selectedFlowerType$.next(type);
    }
    
    setActiveTabIndex(index: number) {
        this.activeTab$.next(index);
    }
}
