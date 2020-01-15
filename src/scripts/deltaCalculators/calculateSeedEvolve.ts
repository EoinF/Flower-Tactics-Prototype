import { StagedSeed } from "../controllers/EvolveSeedController";
import { SUCCESS_INTERVALS, SUCCESS_PLUS_INTERVALS, SUCCESS_PLUS_2_INTERVALS, SUCCESS_PLUS_3_INTERVALS } from "../constants";
import { FlowerType } from "../objects/FlowerType";
import { GameState } from "../objects/GameState";
import { GameStateDelta } from "../objects/GameStateDelta";

export type EvolutionOutcome = 'SUCCESS' | 'FAILURE' | 'SUCCESS+' | 'SUCCESS++' | 'SUCCESS+++';

export function calculateSeedEvolutionOutcome(stagedSeed: StagedSeed, gameState: GameState): EvolutionOutcome {
    if (gameState.getNextRandomNumber(1, 100) <= SUCCESS_PLUS_3_INTERVALS[stagedSeed.stagedAmount]) {
        return 'SUCCESS+++';
    } else if (gameState.getNextRandomNumber(1, 100) <= SUCCESS_PLUS_2_INTERVALS[stagedSeed.stagedAmount]) {
        return 'SUCCESS++';
    } else if (gameState.getNextRandomNumber(1, 100) <= SUCCESS_PLUS_INTERVALS[stagedSeed.stagedAmount]) {
        return 'SUCCESS+';
    } else if (gameState.getNextRandomNumber(1, 100) <= SUCCESS_INTERVALS[stagedSeed.stagedAmount]) {
        return 'SUCCESS';
    } else {
        return 'FAILURE';
    }
}

export function calculateSeedEvolutionResults(outcomeType: EvolutionOutcome, stagedSeed: StagedSeed, gameState: GameState): GameStateDelta[] {
    const existingFlower = gameState.flowerTypes[stagedSeed.type];

    let newFlowerDeltas: GameStateDelta[] = [];
    if (outcomeType === 'SUCCESS+++') {
        newFlowerDeltas = [
            applyImprovements(existingFlower, gameState, 30),
            applyImprovements(existingFlower,  gameState, 30),
            applyImprovements(existingFlower,  gameState, 30),
            applyImprovements(existingFlower,  gameState, 30)
        ]
    } else if (outcomeType === 'SUCCESS++') {
        newFlowerDeltas = [
            applyImprovements(existingFlower, gameState, 18),
            applyImprovements(existingFlower,  gameState, 18),
            applyImprovements(existingFlower,  gameState, 18)
        ]
    } else if (outcomeType === 'SUCCESS+') {
        newFlowerDeltas = [
            applyImprovements(existingFlower, gameState, 10),
            applyImprovements(existingFlower,  gameState, 10),
            applyImprovements(existingFlower,  gameState, 10)
        ]
    } else if (outcomeType === 'SUCCESS') {
        newFlowerDeltas = [
            applyImprovements(existingFlower, gameState, 5),
            applyImprovements(existingFlower,  gameState, 5)
        ]
    }
    
    return newFlowerDeltas;
}

function applyImprovements(baseFlower: FlowerType, gameState: GameState, improvementPoints: number): GameStateDelta {
    // Options:
    // 1) improve turns for growth (should be rare)
    // 2) improve seedProductionRate (small increase but not so rare)
    // 3) improve soilConsumptionRate (should be small and rarish)
    // 4,5,6) improve any of the soil requirements (common)
    // 7) improve tenacity for surviving without nutrients
    //
    // And also, any of the above can be disimproved in semi rare cases
    // Weighted as follows

    const improvementsChances = {
        'growth': 1,
        'soil consumption': 2,
        'seed production': 3,
        'requirements': 4,
        'tenacity': 3
    }
    // points should be distributed randomly (based on the above weights) to improve each of these stats

    const improvementCosts = {
        'growth': 17 - baseFlower.turnsUntilGrown,
        'soil consumption': Math.max(2, 15 - Math.round(baseFlower.soilConsumptionRate / 3)),
        'seed production': Math.max(3, Math.round(baseFlower.seedProductionRate / 2) - 15),
        'requirements': 1,
        'tenacity': 1 + Math.floor(baseFlower.tenacity / 20)
    };

    const delta = new GameStateDelta();

    while(improvementPoints > 0) {
        let improvementChancesArray: string[] = [];
        Object.keys(improvementsChances).forEach(key => {
            if (improvementPoints >= improvementCosts[key]) {
                improvementChancesArray = [...improvementChancesArray, ...new Array(improvementsChances[key]).fill(key)];
            }
        })
        let roll = gameState.getNextRandomNumber(0, improvementChancesArray.length - 1);
        applyImprovementDelta(delta, improvementChancesArray[roll], gameState, 1);
        improvementPoints -= improvementCosts[improvementChancesArray[roll]];
    }

    return delta;
}

function applyImprovementDelta(delta: GameStateDelta, improvementType: string, gameState: GameState, deltaValue: number) {
    switch(improvementType) {
        case 'growth':
            delta.addDelta(["turnsUntilGrown"], -deltaValue);
            break;
        case 'seed production':
            delta.addDelta(["seedProductionRate"], deltaValue);
            break;
        case 'soil consumption':
            delta.addDelta(["soilConsumptionRate"], -deltaValue);
            break;
        case 'requirements':
            const roll = gameState.getNextRandomNumber(1, 3);
            if (roll === 1) {
                const result = improveRequirements(gameState, deltaValue);
                delta.addDelta(["nitrogenMin"], result.min);
                delta.addDelta(["nitrogenMax"], result.max);
            } else if (roll === 2) {
                const result = improveRequirements(gameState, deltaValue);
                delta.addDelta(["potassiumMin"], result.min);
                delta.addDelta(["potassiumMax"], result.max);
            } else {
                const result = improveRequirements(gameState, deltaValue);
                delta.addDelta(["phosphorousMin"], result.min);
                delta.addDelta(["phosphorousMax"], result.max);
            }
            break;
        case 'tenacity':
            delta.addDelta(["tenacity"], deltaValue);
            break;
    }
}

function improveRequirements(gameState: GameState, deltaValue: number) {
    const random = gameState.getNextRandomNumber(0, 1);
    const variance = random === 0 ? -20 : +20;

    return {
        min: (variance - 10) * deltaValue,
        max: (10 + variance) * deltaValue
    }
}
