import { TextLabel } from "./TextLabel";
import { ImageButton } from "./ImageButton";
import { Observable, Subject, merge } from "rxjs";
import { scan, mapTo, map } from "rxjs/operators";
import { BaseUIObject } from "./UIObject";
import { COLOURS } from "../../constants";

export class ArrowSelectionWidget extends BaseUIObject {
    private selectedItem$: Observable<string>;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, choices: string[], defaultChoice: number = 0) {
        super(scene, x, y, width, height);
        const selectNextItem$ = new Subject();
        const selectPreviousItem$ = new Subject();

        this.selectedItem$ = merge(
            selectNextItem$.pipe(mapTo(+1)),
            selectPreviousItem$.pipe(mapTo(-1))
        ).pipe(
            scan((currentIndex, delta) => (
                currentIndex = ((currentIndex + delta) + choices.length) % choices.length
            ), defaultChoice),
            map(index => choices[index])
        );

        const selectedItemLabel = new TextLabel(scene, 0, 0, choices[defaultChoice]).setOrigin(0.5, 0.5);

        const arrowLeft = new ImageButton(scene, 8, 0, "gui-arrow-left", "auto", "auto", COLOURS.TRANSPARENT, COLOURS.TRANSPARENT, COLOURS.WHITE, COLOURS.GRAY)
            .onClick(() => {
                selectPreviousItem$.next();
            });
        const arrowRight = new ImageButton(scene, 8, 0, "gui-arrow-left", "auto", "auto", COLOURS.TRANSPARENT, COLOURS.TRANSPARENT, COLOURS.WHITE, COLOURS.GRAY)
            .onClick(() => {
                selectNextItem$.next();
            });
        arrowRight.image.setFlipX(true);
        
        this.selectedItem$.subscribe(selectedItem => {
            selectedItemLabel.setText(selectedItem);
        });

        this.container.addChild(arrowLeft, "Middle", "Left");
        this.container.addChild(arrowRight, "Middle", "Right");
        this.container.addChild(selectedItemLabel, "Middle", "Middle");

        this.container.setBackground(COLOURS.PURPLE_100);
        this.container.setBorder(1, COLOURS.GRAY);
    }

    onChange(callback: (choice: string) => void) {
        this.selectedItem$.subscribe(selectedItem => {
            callback(selectedItem);
        });
        return this;
    }
}