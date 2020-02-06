import { ReplaySubject, Observable, Subject, combineLatest, merge, of } from "rxjs";
import { mapTo, startWith, map, scan, withLatestFrom, shareReplay, distinctUntilChanged, pairwise, filter, tap } from "rxjs/operators";

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
            this.flowerTypes$.pipe(
                startWith<string[]>([]),
                pairwise(),
                filter(([previous, current]) => previous.length != current.length || current.some(curr => previous.indexOf(curr) === -1)), // Filter out unchanged arrays
                map(([previous, current]) => current)
            ),
            nextAction$
        ).pipe(
            scan((currentIndex, [currentFlowerTypes, nextAction]) => {
                if (nextAction.action === 'reset') {
                    return 0;
                } else if (nextAction.action === 'previous') {
                    return currentIndex == 0 ? (currentFlowerTypes.length - 1) : (currentIndex - 1);
                } else if (nextAction.action === 'next') {
                    return (currentIndex + 1) % currentFlowerTypes.length;
                } else if (nextAction.action === 'index') {
                    return nextAction.value as number;
                } else {
                    return currentFlowerTypes.indexOf(nextAction.value as string);
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
