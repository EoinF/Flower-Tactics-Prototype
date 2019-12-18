import { Subject, BehaviorSubject, Observable } from "rxjs";
import { StringMap } from "../types";

export type StagedSeeds = StringMap<number>;

export class EvolveSeedController {
    private stagedSeeds$: BehaviorSubject<StagedSeeds>;
    
    constructor() {
        this.stagedSeeds$ = new BehaviorSubject({});
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
}