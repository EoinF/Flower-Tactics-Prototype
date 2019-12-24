import { Subject, BehaviorSubject, Observable } from "rxjs";
import { StringMap } from "../types";
import { EvolutionOutcome } from "../deltaCalculators/calculateSeedEvolve";

export interface StagedSeed {
    type: string;
    stagedAmount: number;
}

export type EvolveStatus = EvolutionOutcome | 'INSUFFICIENT_SEEDS';

export class EvolveSeedController {
    private stagedSeed$: BehaviorSubject<StagedSeed | null>;
    private selectedFlowerType$: Subject<string>;
    private evolveStatus$: Subject<EvolveStatus>;
    
    constructor() {
        this.stagedSeed$ = new BehaviorSubject<StagedSeed | null>(null);
        this.selectedFlowerType$ = new Subject();
        this.evolveStatus$ = new Subject();
    }

    setSelectedFlowerType(type: string) {
        this.selectedFlowerType$.next(type);
    }

    stageSeedForEvolution(type: string) {
        const stagedSeed = this.stagedSeed$.value;
        let existingAmount = 0;
        if (stagedSeed != null) {
            existingAmount = stagedSeed.stagedAmount;
        }
        this.stagedSeed$.next({
            type,
            stagedAmount: existingAmount + 1
        });
    }

    unstageSeedForEvolution() {
        const stagedSeed = this.stagedSeed$.value;
        
        if (stagedSeed != null) {
            const newAmount = stagedSeed.stagedAmount - 1;
            if (newAmount > 0) {
                this.stagedSeed$.next({
                    type: stagedSeed.type,
                    stagedAmount: newAmount
                })
            } else {
                this.stagedSeed$.next(null);
            }
        }
    }

    unstageAllSeeds() {
        this.stagedSeed$.next(null);
    }

    setEvolveStatus(evolveStatus: EvolveStatus) {
        this.evolveStatus$.next(evolveStatus);
    }

    stagedSeedsObservable(): Observable<StagedSeed | null> {
        return this.stagedSeed$;
    }

    selectedFlowerTypeObservable(): Observable<string> {
        return this.selectedFlowerType$;
    }

    evolveStatusObservable(): Observable<EvolveStatus> {
        return this.evolveStatus$;
    }
}
