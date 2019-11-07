import { MapController } from "./MapController";

export class SeedController {
    private mapController: MapController;
    private onDragSeedOverMapCallbacks: Array<(seedType: string, x: number, y: number) => void>;
    private onDropSeedOverMapCallbacks: Array<(seedType: string, x: number, y: number) => void>;
    private onSetContainerHighlightedCallbacks: Array<(isHighlighted: boolean) => void>;
    private onDropSeedOverContainerCallbacks: Array<(spriteIndex: number, x: number, y: number) => void>;

    private heldSeed: number | null;
    private savedPositionX: number;
    private savedPositionY: number;

    private isMouseOverContainer: boolean;

    constructor(mapController: MapController) {
        this.mapController = mapController;
        this.onDragSeedOverMapCallbacks = [];
        this.onDropSeedOverMapCallbacks = [];
        this.onSetContainerHighlightedCallbacks = [];
        this.onDropSeedOverContainerCallbacks =[];
    }

    startDraggingSeed(heldSeed: number | null, savedPositionX: number, savedPositionY: number) {
        this.savedPositionX = savedPositionX;
        this.savedPositionY = savedPositionY;
        this.heldSeed = heldSeed;
    }

    dragSeed(type: string, x: number, y: number) {
        if (!this.isMouseOverContainer) {
            this.dragSeedOverMap(type, x, y);
        } else {
            this.mapController.dragSeedOverTile(null);
        }
    }

    dropSeed(type: string, x: number, y: number) {
        if (!this.isMouseOverContainer) {
            this.dropSeedOverMap(type, x, y);
        } else {
            this.dropSeedOverContainer(this.heldSeed!, this.savedPositionX, this.savedPositionY);
        }
    }

    dragSeedOverMap(seedType: string, x: number, y: number) {
        this.onDragSeedOverMapCallbacks.forEach(f => f(seedType, x, y));
    }

    dropSeedOverMap(seedType: string, x: number, y: number) {
        this.onDropSeedOverMapCallbacks.forEach(f => f(seedType, x, y));
    }

    dropSeedOverContainer(seedIndex: number, savedPositionX: number, savedPositionY: number) {
        this.onDropSeedOverContainerCallbacks.forEach(f => f(seedIndex, savedPositionX, savedPositionY));
    }

    setMouseOverContainer(isHighlighted: boolean) {
        this.isMouseOverContainer = isHighlighted;
        this.onSetContainerHighlightedCallbacks.forEach(f => f(isHighlighted));
    }

    onSetContainerHighlighted(callback: (isHighlighted: boolean) => void) {
        this.onSetContainerHighlightedCallbacks.push(callback);
    }

    onDragSeedOverMap(callback: (seedType: string, x: number, y: number) => void) {
        this.onDragSeedOverMapCallbacks.push(callback);
    }

    onDropSeedOverMap(callback: (seedType: string, x: number, y: number) => void) {
        this.onDropSeedOverMapCallbacks.push(callback);
    }
    
    onDropSeedOverContainer(callback: (spriteIndex: number, x: number, y: number) => void) {
        this.onDropSeedOverContainerCallbacks.push(callback);
    }
}