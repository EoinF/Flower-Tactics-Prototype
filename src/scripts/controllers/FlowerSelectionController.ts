import { ReplaySubject, Observable, Subject, BehaviorSubject } from "rxjs";
import { FlowerType } from "../objects/FlowerType";
import { publishReplay, publish, shareReplay, startWith } from "rxjs/operators";

export class FlowerSelectionController {
    private selectedFlowerType$: Subject<string>;
    private selectedFlowerIndex$: BehaviorSubject<number>;

    constructor() {
        this.selectedFlowerType$ = new ReplaySubject(1);
        this.selectedFlowerIndex$ = new BehaviorSubject(0);
    }

    selectFlower(type: string) {
        this.selectedFlowerType$.next(type);
    }
    selectNextFlower() {
        this.selectedFlowerIndex$.next(this.selectedFlowerIndex$.value + 1);
    }
    selectPreviousFlower() {
        this.selectedFlowerIndex$.next(this.selectedFlowerIndex$.value - 1);
    }

    selectFlowerByIndex(index: number) {
        this.selectedFlowerIndex$.next(index);
    }

    selectedFlowerIndexObservable(): Observable<number> {
        return this.selectedFlowerIndex$;
    }

    selectedFlowerTypeObservable(): Observable<string> {
        return this.selectedFlowerType$;
    }
}