import { GameState } from "../objects/GameState";
import { TutorialRunnerCallbacks } from "./TutorialRunner";


interface TutorialEvent {
    occurrencesRemaining: number,
    predicate: (gameState: GameState) => boolean;
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

    stateChange(gameState: GameState, callbacks: TutorialRunnerCallbacks) {
        this.events.forEach((event) => {
            if (event.occurrencesRemaining > 0) {
                if (event.predicate(gameState)) {
                    event.effect(callbacks);
                    event.occurrencesRemaining--;
                }
            }
        })
    }

    addEvent(numOccurrences: number, predicate: (gameState: GameState) => boolean, effect: (callbacks: TutorialRunnerCallbacks) => void) {
        this.events.push({
            occurrencesRemaining: numOccurrences,
            predicate,
            effect
        })
    }
}