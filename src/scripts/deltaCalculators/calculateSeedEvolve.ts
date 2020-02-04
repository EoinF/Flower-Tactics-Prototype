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
            applyImprovements(existingFlower,  gameState, 5),
            applyImprovements(existingFlower,  gameState, 5),
            applyImprovements(existingFlower,  gameState, 5)
        ]
    } else if (outcomeType === 'SUCCESS++') {
        newFlowerDeltas = [
            applyImprovements(existingFlower, gameState, 3),
            applyImprovements(existingFlower,  gameState, 2),
            applyImprovements(existingFlower,  gameState, 2)
        ]
    } else if (outcomeType === 'SUCCESS+') {
        newFlowerDeltas = [
            applyImprovements(existingFlower, gameState, 1),
            applyImprovements(existingFlower,  gameState, 1),
            applyImprovements(existingFlower,  gameState, 1)
        ]
    } else if (outcomeType === 'SUCCESS') {
        newFlowerDeltas = [
            applyImprovements(existingFlower, gameState, 1),
            applyImprovements(existingFlower,  gameState, 1)
        ]
    }
    
    return newFlowerDeltas;
}

function applyImprovements(baseFlower: FlowerType, gameState: GameState, improvementPoints: number): GameStateDelta {
    // Options:
    // 1) improve turns for growth (should be rare)
    // 2) improve seedProductionRate (small increase but not so rare)
    // 3) improve turns until dead (should be rare)
    // 4,5,6) improve any of the soil requirements (common)
    // 7) improve tenacity for surviving without nutrients
    //
    // And also, any of the above can be disimproved in semi rare cases
    // Weighted as follows

    const improvementsChances = {
        'growth': 1,
        'seed production': 3,
        'turns until dead': 2,
        'requirementsUp': 2,
        'requirementsDown': 2,
        'tenacity': 3
    }
    // points should be distributed randomly (based on the above weights) to improve each of these stats

    const improvementCosts = {
        'growth': 1,
        'turns until dead': 1,
        'seed production': 1,
        'requirements': 1,
        'tenacity': 1
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
            delta.addDelta(["seedProductionRate"], deltaValue * 7);
            break;
        case 'turns until dead':
            delta.addDelta(["turnsUntilDead"], deltaValue);
            break;
        case 'requirementsUp':
        case 'requirementsDown':
            const change = improvementType === 'requirementsUp' ? deltaValue: -deltaValue;
            const roll = gameState.getNextRandomNumber(1, 3);
            if (roll === 1) {
                delta.addDelta(["nitrogen"], change);
            } else if (roll === 2) {
                delta.addDelta(["potassium"], change);
            } else {
                delta.addDelta(["phosphorous"], change);
            }
            break;
        case 'tenacity':
            delta.addDelta(["tenacity"], deltaValue * 10);
            break;
    }
}