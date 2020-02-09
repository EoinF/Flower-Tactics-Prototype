import { UIContainer } from "./UIContainer";
import { Subject } from "rxjs";
import { UIObject, BaseUIObject } from "./UIObject";
import { distinctUntilChanged, pairwise, filter, map } from "rxjs/operators";
import { VerticalAlignment, HorizontalAlignment } from "../../types";

type PointerAction = "pointerUp" | "pointerDown" | "pointerUpOverButton"
interface PointerState {
    actionType: PointerAction,
    pointer: Phaser.Input.Pointer
}

export class ClickableWidget extends BaseUIObject {
    protected container: UIContainer;

    protected pointerState$: Subject<PointerState>;
    
    constructor(scene: Phaser.Scene, 
        x: number, y: number,
        width: number, height: number,
        verticalAlignment: VerticalAlignment = "Top",
        horizontalAlignment: HorizontalAlignment = "Left") {
        super(scene, x, y, width, height, verticalAlignment, horizontalAlignment);
        this.container.setInteractive();

        this.pointerState$ = new Subject<PointerState>();
        
        scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            if (this.active) {
                this.pointerState$.next({
                    pointer,
                    actionType: "pointerUp"
                });
                this.onPointerUp();
            }
        });
        this.container.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (this.active) {
                this.pointerState$.next({
                    pointer,
                    actionType: "pointerDown"
                });
                this.onPointerDown();
            }
        });
        this.container.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            if (this.active) {
                this.pointerState$.next({
                    pointer,
                    actionType: "pointerUpOverButton"
                });
            }
        });
    }
    
    protected onPointerUp() {}

    protected onPointerDown() {}

    setPosition (x: number, y: number) {
        this.x = x;
        this.y = y;
        this.container.setPosition(x, y);
        return this;
    }

    setBorder(thickness: number, strokeColour: Phaser.Display.Color) {
        this.borderColour = strokeColour;
        this.borderThickness = thickness;
        this.container.setBorder(thickness, strokeColour);
        return this;
    }

    onClick(callback: (pointer: Phaser.Input.Pointer) => void) {
        this.pointerState$.pipe(
            distinctUntilChanged(),
            pairwise(),
            filter(([previousState, currentState]) => 
                previousState.actionType === "pointerDown"
                && currentState.actionType == "pointerUpOverButton"),
            map(([_, currentState]) => currentState)
        ).subscribe(pointerLocation => callback(pointerLocation.pointer));
    
        return this;
    }
}