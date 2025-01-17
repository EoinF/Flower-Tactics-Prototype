import { Observable, ReplaySubject, Subject } from "rxjs";
import { Tile } from "../objects/Tile";

export interface MapLocation {
    x: number;
    y: number;
}

export class MapController {
    private clickTile$: Subject<number>;
    private mouseOverTile$: Subject<Tile | null>;
    private camera$: Subject<Phaser.Cameras.Scene2D.Camera>;

    constructor() {
        this.mouseOverTile$ = new Subject();
        this.clickTile$ = new Subject();
        this.camera$ = new ReplaySubject(1);
    }

    clickTile(tileIndex: number) {
        this.clickTile$.next(tileIndex);
    }

    setMouseOverTile(tile: Tile | null) {
        this.mouseOverTile$.next(tile);
    }

    setCamera(camera: Phaser.Cameras.Scene2D.Camera) {
        this.camera$.next(camera);
    }

    cameraObservable(): Observable<Phaser.Cameras.Scene2D.Camera> {
        return this.camera$;
    }

    mouseOverTileObservable(): Observable<Tile | null> {
        return this.mouseOverTile$;
    }

    clickTileObservable(): Observable<number> {
        return this.clickTile$;
    }
}