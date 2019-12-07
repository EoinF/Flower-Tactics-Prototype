export interface BaseUIObject {
    x: number;
    y: number;
    width: number;
    height: number;
    originX: number;
    originY: number;
    alpha: number;
    setAlpha: (alpha: number) => BaseUIObject;
    setPosition: (x: number, y: number) => BaseUIObject;
    setVisible: (isVisible: boolean) => BaseUIObject;
    setDepth: (depth: number) => BaseUIObject;
    destroy: () => void;
    getData: (key: string) => any;
    setData: (key: string, value: any) => BaseUIObject;

    removeInteractive: () => BaseUIObject;
}
