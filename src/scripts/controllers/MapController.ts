import { Observable, ReplaySubject, Subject } from "rxjs";
import { Tile } from "../objects/Tile";

interface MapLocation {
    x: number;
    y: number;
}

export class MapController {
    dragSeedOverTile$: Subject<Tile | null>;
    camera$: Subject<Phaser.Cameras.Scene2D.Camera>;

    constructor() {
        this.dragSeedOverTile$ = new ReplaySubject(1);
        this.camera$ = new ReplaySubject(1);
    }

    dragSeedOverTile(tile: Tile | null) {
        this.dragSeedOverTile$.next(tile);
    }

    dragSeedOverTileObservable(): Observable<Tile | null> {
        return this.dragSeedOverTile$;
    }

    setCamera(camera: Phaser.Cameras.Scene2D.Camera) {
        this.camera$.next(camera);
    }

    cameraObservable(): Observable<Phaser.Cameras.Scene2D.Camera> {
        return this.camera$;
    }
}