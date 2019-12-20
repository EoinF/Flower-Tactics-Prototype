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

    unstageSeedForEvolution(type: string) {
        const stagedSeeds = this.stagedSeeds$.value;
        
        const newAmount = stagedSeeds[type] - 1;
        if (newAmount > 0) {
            this.stagedSeeds$.next({
                ...stagedSeeds,
                [type]: newAmount
            })
        } else {
            const newStagedSeeds = JSON.parse(JSON.stringify(stagedSeeds));
            delete newStagedSeeds[type];
            this.stagedSeeds$.next(newStagedSeeds);
        }
    }

    stagedSeedsObservable(): Observable<StagedSeeds> {
        return this.stagedSeeds$;
    }

    selectedFlowerTypeObservable(): Observable<string> {
        return this.selectedFlowerType$;
    }
    
}