import { StagedSeed } from "../controllers/EvolveSeedController";
import { SUCCESS_INTERVALS, SUCCESS_PLUS_INTERVALS, SUCCESS_PLUS_2_INTERVALS, SUCCESS_PLUS_3_INTERVALS } from "../constants";
import { FlowerType } from "../objects/FlowerType";
import { GameState } from "../objects/GameState";
import { NumberRange } from "../types";

export type EvolutionOutcome = 'SUCCESS' | 'FAILURE' | 'SUCCESS+' | 'SUCCESS++' | 'SUCCESS+++';

export interface EvolutionResult {
    outcomeType: EvolutionOutcome;
    newFlower: FlowerType | null;
}

export function calculateSeedEvolve(stagedSeed: StagedSeed, gameState: GameState, nextName: string): EvolutionResult {
    const newFlower = JSON.parse(JSON.stringify(gameState.flowerTypes[stagedSeed.type])) as FlowerType;
    const existingTypes = Object.keys(gameState.flowerTypes).map(type => parseInt(type));
    const nextType = (Math.max(...existingTypes) + 1).toString();
    let outcomeType: EvolutionOutcome = 'FAILURE';

    newFlower.name = nextName;
    newFlower.type = nextType;
    if (gameState.getNextRandomNumber(1, 100) <= SUCCESS_PLUS_3_INTERVALS[stagedSeed.stagedAmount]) {
        outcomeType = 'SUCCESS+++';
        applyImprovements(newFlower, gameState, 30);
    } else if (gameState.getNextRandomNumber(1, 100) <= SUCCESS_PLUS_2_INTERVALS[stagedSeed.stagedAmount]) {
        outcomeType = 'SUCCESS++';
        applyImprovements(newFlower, gameState, 18);
    } else if (gameState.getNextRandomNumber(1, 100) <= SUCCESS_PLUS_INTERVALS[stagedSeed.stagedAmount]) {
        outcomeType = 'SUCCESS+';
        applyImprovements(newFlower, gameState, 10);
    } else if (gameState.getNextRandomNumber(1, 100) <= SUCCESS_INTERVALS[stagedSeed.stagedAmount]) {
        outcomeType = 'SUCCESS';
        applyImprovements(newFlower, gameState, 5);
    }
    
    return {
        outcomeType,
        newFlower: (outcomeType === 'FAILURE' ? null : newFlower)
    }
}

function applyImprovements(newFlower: FlowerType, gameState: GameState, improvementPoints: number) {
    // Options:
    // 1) improve turns for growth (should be rare)
    // 2) improve seedProductionRate (small increase but not so rare)
    // 3) improve soilConsumptionRate (should be small and rarish)
    // 4,5,6) improve any of the soil requirements (common)
    //
    // And also, any of the above can be disimproved in semi rare cases
    // Weighted as follows

    const improvementsChances = {
        'growth': 1,
        'soil consumption': 2,
        'seed production': 3,
        'requirements': 4
    }
    // points should be distributed randomly (based on the above weights) to improve each of these stats

    const improvementCosts = {
        'growth': 17 - newFlower.turnsUntilGrown,
        'soil consumption': 50 - Math.min(40, newFlower.soilConsumptionRate),
        'seed production': 35 - Math.min(30, newFlower.seedProductionRate),
        'requirements': 1
    };

    while(improvementPoints > 0) {
        let improvementChancesArray: string[] = [];
        Object.keys(improvementsChances).forEach(key => {
            if (improvementPoints >= improvementCosts[key]) {
                improvementChancesArray = [...improvementChancesArray, ...new Array(improvementsChances[key]).fill(key)];
            }
        })
        let roll = gameState.getNextRandomNumber(0, improvementChancesArray.length - 1);
        applyImprovementDelta(newFlower, improvementChancesArray[roll], gameState, 1);
        improvementPoints -= improvementCosts[improvementChancesArray[roll]];
    }
}

function applyImprovementDelta(newFlower: FlowerType, improvementType: string, gameState: GameState, delta: number) {
    switch(improvementType) {
        case 'growth':
            newFlower.turnsUntilGrown -= delta;
            break;
        case 'seed production':
            newFlower.seedProductionRate += delta;
            break;
        case 'soil consumption':
            newFlower.soilConsumptionRate -= delta;
            break;
        case 'requirements':
            const roll = gameState.getNextRandomNumber(1, 3);
            if (roll === 1) {
                newFlower.nitrogenRequirements = improveRequirements(newFlower.nitrogenRequirements, gameState, delta);
            } else if (roll === 2) {
                newFlower.potassiumRequirements = improveRequirements(newFlower.potassiumRequirements, gameState, delta);
            } else {
                newFlower.phosphorousRequirements = improveRequirements(newFlower.phosphorousRequirements, gameState, delta);
            }
            break;
    }
}

function improveRequirements(existingRequirements: NumberRange, gameState: GameState, delta: number) {
    const random = gameState.getNextRandomNumber(0, 1);
    const variance = random === 0 ? -20 : +20;

    const newRequirements = {
        min: existingRequirements.min + (variance - 10) * delta,
        max: existingRequirements.max + (10 + variance) * delta
    }
    return newRequirements;
}
