import { Subject, BehaviorSubject, Observable } from "rxjs";
import { StringMap } from "../types";
import { EvolutionOutcome } from "../deltaCalculators/calculateSeedEvolve";
import { GameStateDelta } from "../objects/GameStateDelta";

export interface StagedSeed {
    type: string;
    stagedAmount: number;
}

export interface EvolutionChoice {
    baseFlowerType: string;
    newFlowerDelta: GameStateDelta;
    newFlowerName: string;
}

export class EvolveSeedController {
    private stagedSeed$: BehaviorSubject<StagedSeed | null>;
    private selectedFlowerType$: Subject<string>;
    private evolveStatus$: Subject<EvolutionOutcome>;
    private flowerNames$: Subject<string[]>;
    private evolveChoices$: Subject<EvolutionChoice[]>;
    private selectedEvolveChoice$: Subject<number>;
    
    constructor() {
        this.flowerNames$ = new Subject();
        this.stagedSeed$ = new BehaviorSubject<StagedSeed | null>(null);
        this.selectedFlowerType$ = new Subject();
        this.evolveStatus$ = new Subject();
        this.evolveChoices$ = new Subject();
        this.selectedEvolveChoice$ = new Subject();
    }

    setFlowerNames(names: string[]) {
        this.flowerNames$.next(names);
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

    setEvolveStatus(evolveStatus: EvolutionOutcome) {
        this.evolveStatus$.next(evolveStatus);
    }

    setEvolveChoices(evolveChoices: EvolutionChoice[]) {
        this.evolveChoices$.next(evolveChoices);
    }

    selectEvolveChoice(choice: number) {
        this.selectedEvolveChoice$.next(choice)
    }

    stagedSeedsObservable(): Observable<StagedSeed | null> {
        return this.stagedSeed$;
    }

    selectedFlowerTypeObservable(): Observable<string> {
        return this.selectedFlowerType$;
    }

    evolveStatusObservable(): Observable<EvolutionOutcome> {
        return this.evolveStatus$;
    }

    evolveChoicesObservable(): Observable<EvolutionChoice[]> {
        return this.evolveChoices$;
    }

    onSelectEvolveChoiceObservable(): Observable<number> {
        return this.selectedEvolveChoice$;
    }

    flowerNamesObservable(): Observable<string[]> {
        return this.flowerNames$;
    }
}
