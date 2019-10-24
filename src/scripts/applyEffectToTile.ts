import { Tile } from "./objects/Tile";

export function applyRiverEffect(tile: Tile, amount: number): Tile {
    return new Tile(tile.index, {
        nitrogenContent: tile.soil.nitrogenContent + 0.002 * amount,
        phosphorousContent: tile.soil.phosphorousContent + 0.001 * amount,
        potassiumContent: tile.soil.potassiumContent + 0.001 * amount
    }, tile.flowers);
}