import { Subject, BehaviorSubject, Observable } from "rxjs";
import { StringMap } from "../types";
import { EvolutionOutcome } from "../deltaCalculators/calculateSeedEvolve";

export type StagedSeeds = StringMap<number>;

export type EvolveStatus = EvolutionOutcome | 'INSUFFICIENT_SEEDS';

export class EvolveSeedController {
    private stagedSeeds$: BehaviorSubject<StagedSeeds>;
    private selectedFlowerType$: Subject<string>;
    private evolveStatus$: Subject<EvolveStatus>;
    
    constructor() {
        this.stagedSeeds$ = new BehaviorSubject({});
        this.selectedFlowerType$ = new Subject();
        this.evolveStatus$ = new Subject();
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

    unstageAllSeeds() {
        this.stagedSeeds$.next({});
    }

    setEvolveStatus(evolveStatus: EvolveStatus) {
        this.evolveStatus$.next(evolveStatus);
    }

    stagedSeedsObservable(): Observable<StagedSeeds> {
        return this.stagedSeeds$;
    }

    selectedFlowerTypeObservable(): Observable<string> {
        return this.selectedFlowerType$;
    }

    evolveStatusObservable(): Observable<EvolveStatus> {
        return this.evolveStatus$;
    }
    
}