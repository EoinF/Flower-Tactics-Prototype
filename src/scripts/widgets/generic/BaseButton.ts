import { ClickableWidget } from "./ClickableWidget";
import { VerticalAlignment, HorizontalAlignment } from "../../types";
import { COLOURS } from "../../constants";
import { Subject, merge, Observable } from "rxjs";
import { map, distinctUntilKeyChanged, filter } from "rxjs/operators";

interface HoverEvent {
    type: 'IN' | 'OUT';
    pointer: Phaser.Input.Pointer;
}

export class BaseButton extends ClickableWidget {
    colourUp: Phaser.Display.Color;
    colourDown: Phaser.Display.Color;
    private hoverEvents$: Observable<HoverEvent>;

    constructor(
        scene: Phaser.Scene, 
        x: number, y: number,
        width: number, height: number,
        colourUp: Phaser.Display.Color,
        colourDown: Phaser.Display.Color,
        verticalAlignment: VerticalAlignment = "Top",
        horizontalAlignment: HorizontalAlignment = "Left"
    ) {
        super(scene, x, y, width, height, verticalAlignment, horizontalAlignment);

        this.container.setBackground(colourUp);
        this.colourUp = colourUp;
        this.colourDown = colourDown;
        this.borderThickness = 0;
        this.borderColour = COLOURS.BLACK;
        
        const mouseMoveOutside$ = new Subject<Phaser.Input.Pointer>();
        const mouseMoveInside$ = new Subject<Phaser.Input.Pointer>();

        scene.input.on('pointermove', (pointer) => {
            if (this.hits(pointer.x, pointer.y)) {
                mouseMoveInside$.next(pointer);
            } else {
                mouseMoveOutside$.next(pointer);
            }
        });

        this.hoverEvents$ = merge<HoverEvent>(
            mouseMoveOutside$.pipe(map(
                pointer => ({type: 'OUT', pointer}))
            ),
            mouseMoveInside$.pipe(map<Phaser.Input.Pointer, HoverEvent>(
                pointer => ({type: 'IN', pointer}))
            ),
        ).pipe(
            distinctUntilKeyChanged("type")
        );
    }

    protected onPointerUp() {
        this.container.setBackground(this.colourUp);
    }
    protected onPointerDown() {
        this.container.setBackground(this.colourDown);
    }

    setBackground(colourUp: Phaser.Display.Color, colourDown: Phaser.Display.Color) {
        this.colourUp = colourUp;
        this.colourDown = colourDown;
        this.container.setBackground(this.colourUp);
        return this;
    }

    onHover(callback: (pointer: Phaser.Input.Pointer) => void) {
        this.hoverEvents$.pipe(
            filter(event => event.type === 'IN')
        ).subscribe((event) => {
            this.onPointerDown();
            callback(event.pointer);
        });
        return this;
    };

    onLeave(callback: (pointer: Phaser.Input.Pointer) => void) {
        this.hoverEvents$.pipe(
            filter(event => event.type === 'OUT')
        ).subscribe((event) => {
            this.onPointerUp();
            callback(event.pointer);
        });
        return this;
    };
}