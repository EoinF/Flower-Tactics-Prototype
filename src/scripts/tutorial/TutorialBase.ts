import { GameState } from "../objects/GameState";
import { TutorialRunnerCallbacks } from "./TutorialRunner";
import { StagedSeed } from "../controllers/EvolveSeedController";

type TutorialEventPredicate = (gameState: GameState, playerId: string, isEvolveScreenOpen: boolean, stagedSeed: StagedSeed | null) => boolean;

interface TutorialEvent {
    occurrencesRemaining: number;
    predicate: TutorialEventPredicate;
    effect: (callback: TutorialRunnerCallbacks) => void;
}

export abstract class TutorialBase {
    title: string;
    events: TutorialEvent[]

    constructor(title: string) {
        this.title = title;
        this.events = [];
    }

    abstract startGame(gameState: GameState, callbacks: TutorialRunnerCallbacks): void;

    stateChange(gameState: GameState, playerId: string, isEvolveScreenOpen: boolean, stagedSeed: StagedSeed | null,  callbacks: TutorialRunnerCallbacks) {
        this.events.forEach((event) => {
            if (event.occurrencesRemaining > 0) {
                if (event.predicate(gameState, playerId, isEvolveScreenOpen, stagedSeed)) {
                    event.occurrencesRemaining--;
                    event.effect(callbacks);
                }
            }
        })
    }

    addEvent(numOccurrences: number, predicate: TutorialEventPredicate, effect: (callbacks: TutorialRunnerCallbacks) => void) {
        this.events.push({
            occurrencesRemaining: numOccurrences,
            predicate,
            effect
        })
    }
}