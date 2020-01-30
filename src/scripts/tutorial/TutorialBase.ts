import { GameState } from "../objects/GameState";
import { TutorialRunnerCallbacks } from "./TutorialRunner";
import { StagedSeed } from "../controllers/EvolveSeedController";

type TutorialEventPredicate = (gameState: GameState, playerId: string, isEvolveScreenOpen: boolean, stagedSeed: StagedSeed | null) => boolean;
type GameEffect = (callback: TutorialRunnerCallbacks, gameState: GameState) => void;

interface TutorialEvent {
    occurrencesRemaining: number;
    predicate: TutorialEventPredicate;
    effect: GameEffect;
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
                    event.effect(callbacks, gameState);
                }
            }
        })
    }

    addEvent(numOccurrences: number, predicate: TutorialEventPredicate, effect: GameEffect) {
        this.events.push({
            occurrencesRemaining: numOccurrences,
            predicate,
            effect
        })
    }
}