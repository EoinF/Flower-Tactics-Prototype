import { StringMap } from "../types";

type GameStateKey = number | string;

interface GameStateDeltaInstance {
    keys: GameStateKey[];
    deltaValue: number | null | object;
    deltaType: DeltaType;
}

type DeltaType = "DELTA_ADD" | "DELTA_REMOVE" | "DELTA_REPLACE";

export class GameStateDelta {
    private deltas: StringMap<GameStateDeltaInstance>;
    private intermediateDeltas: StringMap<any>;
    constructor() {
        this.deltas = {};
        this.intermediateDeltas = {};
    }

    addDelta(keys: GameStateKey[], deltaValue: number | null | object, deltaType: DeltaType = "DELTA_ADD") {
        const combinedKey = `${keys.join(".")}:${deltaType}`;
        const existingValue = this.deltas[combinedKey];
        if (existingValue != null) {
            if (deltaType === 'DELTA_ADD') {
                this.deltas[combinedKey] = {
                    ...existingValue, 
                    deltaValue: (existingValue.deltaValue as number) + (deltaValue as number)
                };
            } else {
                console.log(`Warning: Can't apply ${deltaType} twice`);
            }
        } else {
            this.deltas[combinedKey] = { keys, deltaValue, deltaType};
        }
        return this;
    }

    getDeltas(): Array<GameStateDeltaInstance> {
        return Object.keys(this.deltas).map(key => this.deltas[key]);
    }
    
    addIntermediateDelta<T>(key: string, updateFunction: (existingValue: T | null) => T) {
        this.intermediateDeltas[key] = updateFunction(this.intermediateDeltas[key]);
    }

    getIntermediateDelta<T>(key: string): T | null {
        return this.intermediateDeltas[key];
    }
    
    combineDeltas(otherDelta: GameStateDelta): GameStateDelta {
        Object.keys(otherDelta.deltas).forEach((key) => {
            const delta = otherDelta.deltas[key];
            this.addDelta(delta.keys, delta.deltaValue, delta.deltaType);
        });
        return this;
    }
}
