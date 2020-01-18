import { Subject, Observable, ReplaySubject } from "rxjs";
import { startWith } from "rxjs/operators";

export class SelectedObjectController {
    private selectedTile$: Subject<number>;
    private activeTab$: ReplaySubject<number>;

    constructor() {
        this.selectedTile$ = new Subject<number>();
        this.activeTab$ = new ReplaySubject(1);
    }

    selectedTileObservable(): Observable<number | null> {
        return this.selectedTile$.pipe(
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
    
    setActiveTabIndex(index: number) {
        this.activeTab$.next(index);
    }
}
