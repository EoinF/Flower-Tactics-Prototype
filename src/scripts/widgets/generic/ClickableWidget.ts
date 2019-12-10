import { UIContainer } from "./UIContainer";
import { Subject } from "rxjs";
import { BaseUIObject } from "./BaseUIObject";
import { distinctUntilChanged, pairwise, filter, map } from "rxjs/operators";
import { VerticalAlignment, HorizontalAlignment } from "../../types";

type PointerAction = "pointerUp" | "pointerDown" | "pointerUpOverButton"
interface PointerState {
    actionType: PointerAction,
    pointer: { x: number, y: number }
}

export class ClickableWidget implements BaseUIObject {
    x: number;
    y: number;
    width: number;
    height: number;

    originX: number;
    originY: number;

    alpha: number;
    borderThickness: number;
    borderColour: Phaser.Display.Color;
    visible: boolean;

    protected container: UIContainer;

    protected pointerState$: Subject<PointerState>;
    
    constructor(scene: Phaser.Scene, 
        x: number, y: number,
        width: number, height: number,
        verticalAlignment: VerticalAlignment = "Top",
        horizontalAlignment: HorizontalAlignment = "Left") {
        
        this.container = new UIContainer(scene, x, y, width, height, verticalAlignment, horizontalAlignment);
        this.container.setInteractive();

        this.pointerState$ = new Subject<PointerState>();
        this.visible = true;
        
        scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            this.pointerState$.next({
                pointer,
                actionType: "pointerUp"
            });
            this.onPointerUp();
        });
        this.container.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            this.pointerState$.next({
                pointer,
                actionType: "pointerDown"
            });
            this.onPointerDown();
        });
        this.container.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            this.pointerState$.next({
                pointer,
                actionType: "pointerUpOverButton"
            });
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

    setVisible (isVisible: boolean) {
        this.visible = isVisible;
        this.container.setVisible(isVisible);
        return this;
    }
    setDepth (depth: number) {
        this.container.setDepth(depth);
        return this;
    }

    getData(key: string) {
        return this.container.getData(key);
    }

    setData(key: string, value: any) {
        this.container.setData(key, value);
        return this;
    }

    removeInteractive() {
        this.container.removeInteractive();
        return this;
    }

    destroy() {
        this.container.destroy();
    }

    setBorder(thickness: number, strokeColour: Phaser.Display.Color) {
        this.borderColour = strokeColour;
        this.borderThickness = thickness;
        this.container.setBorder(thickness, strokeColour);
        return this;
    }

    onClick(callback: (pointer: {x: number, y: number}) => void) {
        this.pointerState$.pipe(
            distinctUntilChanged(),
            pairwise(),
            filter(([previousState, currentState]) => 
                previousState.actionType === "pointerDown"
                && currentState.actionType == "pointerUpOverButton"),
            map(([_, currentState]) => ({x: currentState.pointer.x, y: currentState.pointer.y}))
        ).subscribe(pointerLocation => callback(pointerLocation));
    
        return this;
    }

    setAlpha(alpha: number) {
        this.container.setAlpha(alpha);
        return this;
    }

    hits(x: number, y: number) {
        return this.container.hits(x, y);
    }
    
}