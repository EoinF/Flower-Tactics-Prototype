import { Subject, BehaviorSubject, Observable } from "rxjs";
import { StringMap } from "../types";

export type StagedSeeds = StringMap<number>;

export class EvolveSeedController {
    private stagedSeeds$: BehaviorSubject<StagedSeeds>;
    private selectedFlowerType$: Subject<string>;
    
    constructor() {
        this.stagedSeeds$ = new BehaviorSubject({});
        this.selectedFlowerType$ = new Subject();
    }
    setSelectedFlowerType(type: string) {
        this.selectedFlowerType$.next(type);
    }

    stageSeedForEvolution(type: string) {
        const stagedSeeds = this.stagedSeeds$.value;
        const existingAmount = (type in stagedSeeds) ? stagedSeeds[type] : 0
        
        this.stagedSeeds$.next({
            ...stagedSeeds,
            [type]: existingAmount + 1
        });
    }

    stagedSeedsObservable(): Observable<StagedSeeds> {
        return this.stagedSeeds$;
    }

    selectedFlowerTypeObservable(): Observable<string> {
        return this.selectedFlowerType$;
    }
    
}