import { Subject, Observable } from "rxjs";

type HeldObject = 'SEED' | 'CLOUD';

export class HeldObjectController {
    private heldObject$: Subject<HeldObject | null>;

    constructor() {
        this.heldObject$ = new Subject();
    }

    setHeldObject(object: HeldObject) {
        this.heldObject$.next(object);
    }

    heldObjectObservable(): Observable<HeldObject | null> {
        return this.heldObject$;
    }
}