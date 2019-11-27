import { ReplaySubject, Observable, Subject, BehaviorSubject } from "rxjs";
import { FlowerType } from "../objects/FlowerType";

export class FlowerSelectionController {
    private selectedFlowerType$: Subject<FlowerType>;
    private selectedFlowerIndex$: BehaviorSubject<number>;

    constructor() {
        this.selectedFlowerType$ = new ReplaySubject(1);
        this.selectedFlowerIndex$ = new BehaviorSubject(0);
    }

    selectFlower(type: FlowerType) {
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

    selectedFlowerObservable(): Observable<FlowerType> {
        return this.selectedFlowerType$;
    }
}