import { StagedSeed } from "../controllers/EvolveSeedController";
import { SUCCESS_INTERVALS } from "../constants";
import { FlowerType } from "../objects/FlowerType";
import { GameState } from "../objects/GameState";
import { NumberRange } from "../types";

export type EvolutionOutcome = 'SUCCESS' | 'FAILURE' | 'SUCCESS+' | 'SUCCESS++' | 'SUCCESS+++';

export interface EvolutionResult {
    outcomeType: EvolutionOutcome;
    newFlower: FlowerType | null;
}

export function calculateSeedEvolve(stagedSeed: StagedSeed, gameState: GameState): EvolutionResult {
    const oldFlower = gameState.flowerTypes[stagedSeed.type];
    const existingTypes = Object.keys(gameState.flowerTypes).map(type => parseInt(type));
    const nextType = (Math.max(...existingTypes) + 1).toString();

    if (gameState.getNextRandomNumber(1, 100) <= SUCCESS_INTERVALS[stagedSeed.stagedAmount]) {
        return {
            outcomeType: 'SUCCESS',
            newFlower: {
                type: nextType,
                turnsUntilGrown: oldFlower.turnsUntilGrown,
                name: `${oldFlower.name}+`,
                seedProductionRate: oldFlower.seedProductionRate,
                soilConsumptionRate: oldFlower.soilConsumptionRate,
                nitrogenRequirements: improveRequirements(oldFlower.nitrogenRequirements, gameState),
                phosphorousRequirements: improveRequirements(oldFlower.phosphorousRequirements, gameState),
                potassiumRequirements: improveRequirements(oldFlower.potassiumRequirements, gameState),
            }
        }
    }
    
    return {
        outcomeType: 'FAILURE',
        newFlower: null
    }
}

function improveRequirements(existingRequirements: NumberRange, gameState: GameState) {
    return existingRequirements;
}
