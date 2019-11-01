
export class SelectedTileController {
    callbacks: Array<(x: number, y: number) => void>

    constructor() {
        this.callbacks = [];
    }

    onChange(callback: (x: number, y: number) => void) {
        this.callbacks.push(callback);
    }

    setActiveTile(tileX: number, tileY: number) {
        this.callbacks.forEach(f => f(tileX, tileY));
    }
}