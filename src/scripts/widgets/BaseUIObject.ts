export interface BaseUIObject {
    x: number;
    y: number;
    width: number;
    height: number;
    setPosition: (x: number, y: number) => BaseUIObject;
    setVisible: (isVisible: boolean) => BaseUIObject;
    setDepth: (depth: number) => BaseUIObject;
    destroy: () => void;
    getData: (key: string) => any;
    setData: (key: string, value: any) => BaseUIObject;

    removeInteractive: () => BaseUIObject;
}
