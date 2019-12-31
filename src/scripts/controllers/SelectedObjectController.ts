import { Subject, Observable, merge, BehaviorSubject, ReplaySubject } from "rxjs";
import { mapTo, startWith, shareReplay } from "rxjs/operators";
import { MapLocation } from "./MapController";

export class SelectedObjectController {
    private selectedTile$: Subject<number>;
    private selectedFlowerType$: Subject<string>;
    private activeTab$: ReplaySubject<number>;

    constructor() {
        this.selectedTile$ = new Subject<number>();
        this.selectedFlowerType$ = new Subject<string>();
        this.activeTab$ = new ReplaySubject(1);
    }

    selectedTileObservable(): Observable<number | null> {
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
        return this.activeTab$.pipe(
            startWith(0)
        );
    }

    setSelectedTile(tileIndex: number) {
        this.selectedTile$.next(tileIndex);
    }

    setSelectedFlowerType(type: string) {
        this.selectedFlowerType$.next(type);
    }
    
    setActiveTabIndex(index: number) {
        this.activeTab$.next(index);
    }
}
