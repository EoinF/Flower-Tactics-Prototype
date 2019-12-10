export interface StringMap<T> {
    [key: string]: T;
}

export interface NumberRange {
    min: number;
    max: number;
}

export type VerticalAlignment = "Top" | "Bottom" | "Middle";
export type HorizontalAlignment = "Left" | "Right" | "Middle";