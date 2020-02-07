import { StagedSeed } from "../controllers/EvolveSeedController";
import { SUCCESS_INTERVALS, SUCCESS_PLUS_INTERVALS, SUCCESS_PLUS_2_INTERVALS, SUCCESS_PLUS_3_INTERVALS, NITROGEN_VALUE_RANGE, PHOSPHOROUS_VALUE_RANGE, POTASSIUM_VALUE_RANGE } from "../constants";
import { FlowerType } from "../objects/FlowerType";
import { GameState } from "../objects/GameState";
import { GameStateDelta } from "../objects/GameStateDelta";

export type EvolutionOutcome = 'SUCCESS' | 'FAILURE' | 'SUCCESS+' | 'SUCCESS++' | 'SUCCESS+++';

type ImprovementOption = 'growth' | 'seed production' | 'turns until dead' | 'tenacity' |
    'nitrogenUp' | 'nitrogenDown' | 'potassiumUp' | 'potassiumDown' | 'phosphorousUp' | 'phosphorousDown';

type ImprovementMap = {
    [key in ImprovementOption]: number;
}

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
    let numOptions = 0;
    let pointsPerOption = 0;
    if (outcomeType === 'SUCCESS+++') {
        numOptions = 3;
        pointsPerOption = 7;
    } else if (outcomeType === 'SUCCESS++') {
        numOptions = 3;
        pointsPerOption = 4;
    } else if (outcomeType === 'SUCCESS+') {
        numOptions = 3;
        pointsPerOption = 2;
    } else if (outcomeType === 'SUCCESS') {
        numOptions = 2;
        pointsPerOption = 1;
    }
    newFlowerDeltas = new Array(numOptions)
        .fill(undefined)
        .reduce<Array<ImprovementOption[]>>(previousChoices =>
            {
                return [
                    ...previousChoices,
                    calculateImprovements(existingFlower, gameState, pointsPerOption, previousChoices)
                ];
            },
            [] as Array<ImprovementOption[]>
        ).map(
            improvementOptionArray => {
                return improvementOptionArray.reduce((delta, nextImprovement) => (
                    applyImprovementDelta(delta, nextImprovement, gameState, 1)
                ), new GameStateDelta())
            }
        );
    
    return newFlowerDeltas;
}

function calculateImprovements(baseFlower: FlowerType, gameState: GameState, improvementPoints: number, previousChoices: Array<ImprovementOption[]>): ImprovementOption[] {
    // Options:
    // 1) improve turns for growth (should be rare)
    // 2) improve seedProductionRate (small increase but not so rare)
    // 3) improve turns until dead (should be rare)
    // 4,5,6) improve any of the soil requirements (common)
    // 7) improve tenacity for surviving without nutrients
    //
    // And also, any of the above can be disimproved in semi rare cases
    // Weighted as follows

    const improvementsChances: ImprovementMap = {
        'growth': 5,
        'turns until dead': 5,
        'nitrogenUp': 1,
        'nitrogenDown': 1,
        'phosphorousUp': 1,
        'phosphorousDown': 1,
        'potassiumUp': 1,
        'potassiumDown': 1,
        'tenacity': 7,
        'seed production': 7
    }
    // points should be distributed randomly (based on the above weights) to improve each of these stats

    const improvementCosts: ImprovementMap = {
        'growth': 2,
        'turns until dead': 2,
        'seed production': 1,
        'nitrogenUp': 1,
        'nitrogenDown': 1,
        'phosphorousUp': 1,
        'phosphorousDown': 1,
        'potassiumUp': 1,
        'potassiumDown': 1,
        'tenacity': 1
    };

    const improvements: ImprovementOption[] = [];

    while(improvementPoints > 0) {
        let improvementChancesArray: ImprovementOption[] = [];
        (Object.keys(improvementsChances) as ImprovementOption[]).forEach(key => {
            if (improvementPoints >= improvementCosts[key] && !isUsedPreviously(key, previousChoices) && isAllowed(key, baseFlower, improvements)) {
                improvementChancesArray = [...improvementChancesArray, ...new Array(improvementsChances[key]).fill(key)];
            }
        })
        let roll = gameState.getNextRandomNumber(0, improvementChancesArray.length - 1);
        const improvementType = improvementChancesArray[roll];
        improvements.push(improvementType);
        improvementPoints -= improvementCosts[improvementChancesArray[roll]];
    }

    return improvements;
}

function isUsedPreviously(key: ImprovementOption, previousChoices: Array<ImprovementOption[]>) {
    return previousChoices.some(previousChoiceImprovements => {
        return previousChoiceImprovements[0] === key
    });
}

function isAllowed(key: ImprovementOption, baseFlower: FlowerType, currentImprovements: ImprovementOption[]): boolean {
    const currentImprovementAmount = currentImprovements.map<number>(
        option => option === key ? 1 : 0
    ).reduce(
        (total, nextValue) => total + nextValue,
         0
    );
    switch(key) {
        case "growth":
            return baseFlower.turnsUntilGrown - currentImprovementAmount > 0;
        case "turns until dead":
        case "seed production":
            return true;
        case "nitrogenUp":
            return currentImprovements.indexOf('nitrogenUp') === -1
                && currentImprovements.indexOf('nitrogenDown') === -1
                && baseFlower.nitrogen < NITROGEN_VALUE_RANGE.max;
        case 'nitrogenDown':
            return currentImprovements.indexOf('nitrogenUp') === -1
                && currentImprovements.indexOf('nitrogenDown') === -1
                && currentImprovementAmount === 0 && baseFlower.nitrogen > NITROGEN_VALUE_RANGE.min;
        case 'phosphorousUp':
            return currentImprovements.indexOf('phosphorousUp') === -1
                && currentImprovements.indexOf('phosphorousDown') === -1
                && currentImprovementAmount === 0 && baseFlower.phosphorous < PHOSPHOROUS_VALUE_RANGE.max;
        case 'phosphorousDown':
            return currentImprovements.indexOf('phosphorousUp') === -1
                && currentImprovements.indexOf('potassiumDown') === -1
                && currentImprovementAmount === 0 && baseFlower.phosphorous > PHOSPHOROUS_VALUE_RANGE.min;
        case 'potassiumUp':
            return currentImprovements.indexOf('potassiumUp') === -1
                && currentImprovements.indexOf('nitrogenDown') === -1
                && currentImprovementAmount === 0 && baseFlower.potassium < POTASSIUM_VALUE_RANGE.max;
        case 'potassiumDown':
            return currentImprovements.indexOf('potassiumUp') === -1
                && currentImprovements.indexOf('potassiumDown') === -1
                && currentImprovementAmount === 0 && baseFlower.potassium > POTASSIUM_VALUE_RANGE.min;
        case 'tenacity':
            return baseFlower.tenacity + (currentImprovementAmount * 5) < 95;
    }
}

function applyImprovementDelta(delta: GameStateDelta, improvementType: ImprovementOption, gameState: GameState, deltaValue: number): GameStateDelta {
    switch(improvementType) {
        case 'growth':
            delta.addDelta(["turnsUntilGrown"], -deltaValue);
            break;
        case 'seed production':
            delta.addDelta(["seedProductionRate"], deltaValue * 5);
            break;
        case 'turns until dead':
            delta.addDelta(["turnsUntilDead"], deltaValue);
            break;
        case 'nitrogenUp':
            delta.addDelta(["nitrogen"], +deltaValue);
            break;
        case 'nitrogenDown':
            delta.addDelta(["nitrogen"], -deltaValue);
            break;
        case 'phosphorousUp':
            delta.addDelta(["phosphorous"], +deltaValue);
            break;
        case 'phosphorousDown':
            delta.addDelta(["phosphorous"], -deltaValue);
            break;
        case 'potassiumUp':
            delta.addDelta(["potassium"], +deltaValue);
            break;
        case 'potassiumDown':
            delta.addDelta(["potassium"], -deltaValue);
            break;
        case 'tenacity':
            delta.addDelta(["tenacity"], deltaValue * 8);
            break;
    }
    return delta;
}