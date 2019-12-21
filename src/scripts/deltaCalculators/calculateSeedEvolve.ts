import { StagedSeeds } from "../controllers/EvolveSeedController";

export type EvolutionOutcome = 'SUCCESS' | 'FAILURE' | 'SUCCESS+' | 'SUCCESS++' | 'SUCCESS+++';

export interface EvolutionResult {
    outcomeType: EvolutionOutcome;
}

export function calculateSeedEvolve(stagedSeeds: StagedSeeds): EvolutionResult {

    return {
        outcomeType: 'FAILURE'
    }
}