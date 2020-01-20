import { ReplaySubject, Observable, Subject, combineLatest, merge, of } from "rxjs";
import { mapTo, startWith, map, scan, withLatestFrom, shareReplay, tap, distinctUntilChanged } from "rxjs/operators";

interface SelectByIndexAction {
    index: number;
}

interface SelectByTypeAction {
    type: string;
}

export class FlowerSelectionController {
    private selectedFlowerType$: Observable<string>;
    private selectNextFlower$: Subject<void>;
    private selectPreviousFlower$: Subject<void>;
    private selectFlowerIndex$: Subject<number>;
    private flowerTypes$: Subject<string[]>;
    private selectFlowerByType$: Subject<string>;

    constructor() {
        this.selectNextFlower$ = new Subject();
        this.selectPreviousFlower$ = new Subject();
        this.selectFlowerIndex$ = new Subject();
        this.selectFlowerByType$ = new Subject();
        this.flowerTypes$ = new ReplaySubject(1);

        const nextAction$ = merge(
            of({action: 'reset', value: null}),
            this.selectNextFlower$.pipe(mapTo({action: 'next', value: null})),
            this.selectPreviousFlower$.pipe(mapTo({action: 'previous', value: null})),
            this.selectFlowerIndex$.pipe(
                map(index => ({action: 'index', value: index}))
            ),
            this.selectFlowerByType$.pipe(
                map(type => ({action: 'type', value: type}))
            )
        );
            
        this.selectedFlowerType$ = combineLatest(
            this.flowerTypes$,
            nextAction$
        ).pipe(
            scan((currentIndex, [flowerTypes, nextAction]) => {
                if (nextAction.action === 'reset') {
                    return currentIndex;
                } else if (nextAction.action === 'next') {
                    return currentIndex == 0 ? (flowerTypes.length - 1) : (currentIndex - 1);
                } else if (nextAction.action === 'previous') {
                    return (currentIndex + 1) % flowerTypes.length;
                } else if (nextAction.action === 'index') {
                    return nextAction.value as number;
                } else {
                    return flowerTypes.indexOf(nextAction.value as string);
                }
            }, 0),
            withLatestFrom(this.flowerTypes$),
            map(([flowerTypeIndex, flowerTypes]) => flowerTypes[flowerTypeIndex]),
            distinctUntilChanged(),
            shareReplay(1)
        );
    }

    setFlowerTypes(types: string[]) {
        this.flowerTypes$.next(types);
    }
    
    selectFlowerByType(type: string) {
        this.selectFlowerByType$.next(type);
    }

    selectNextFlower() {
        this.selectNextFlower$.next();
    }

    selectPreviousFlower() {
        this.selectPreviousFlower$.next();
    }

    selectFlowerByIndex(index: number) {
        this.selectFlowerIndex$.next(index);
    }

    selectedFlowerTypeObservable(): Observable<string> {
        return this.selectedFlowerType$;
    }
}
