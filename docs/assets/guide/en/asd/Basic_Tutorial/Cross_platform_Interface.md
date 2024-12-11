# Cross-platform API Usage

This chapter is not necessary for development, but if your application needs to run in different environments (nodejs, browser, mini programs) and you don't want to write compatibility code yourself, such as getting devicePixelRatio (dpr), creating Canvas, or using some utility functions, you can read this chapter.
VRender provides a series of default interfaces to shield the impact of cross-platform, currently supporting `Browser`, `Node`, `feishu`, `tt`, and other environments can be supported through extensions.

## Global

Global is a static class that provides global cross-platform APIs. Users can directly use Global as if it were the window of a browser, and Global will automatically provide cross-platform compatibility.

> Global needs to manually set the environment, no need to add cross-platform methods by yourself
> Note: When using the nodejs environment, Canopus will not automatically reference node-canvas, so users need to manually pass the node-canvas package

```ts
type IEnv = 'feishu' | 'tt' | 'browser' | 'node';

interface IDocument {
  createElement(t: 'canvas'): HTMLCanvasElement;
  createElement(t: string): HTMLElement;
}

export interface IGlobal {
  readonly env: IEnv;
  // If it is a nodejs environment, params must be passed
  setEnv: (env: IEnv, params: { canvasPkg?: { canvas: any; loadImage: any } }) => void;
  createCanvas: () => ICanvas;
  releaseCanvas: (canvas: ICanvas) => void;
  getImageData: (ctx?: IContext2d) => ImageData;
  // Load image
  loadImage: (url: string, type: 'Image' | 'ImageData') => HTMLImageElement | Image | ImageData;
  // RAF
  requestAnimationFrame: IRequestAnimationFrame;
  // Get devicePixelRatio
  devicePixelRatio: number;
  document: IDocument;
}
```

## GraphicUtil

Unlike Global, GraphicUtil provides cross-platform and graphic-related APIs, including Transform API and MeasureText API.

The Transform module is convenient for users to manually transform based on an existing transformation configuration to another space.

```ts
interface IGraphicUtil {
  canvas?: ICanvas;
  context?: IContext2d | null;
  textMeasure: ITextMeasure;
  measureText: (text: string, tc: TextOptionsType) => { width: number; height: number };
  bindTextMeasure: (tm: ITextMeasure) => void;
  createTextMeasureInstance: (
    textSpec?: Partial<ITextAttribute>,
    option?: Partial<ITextMeasureOption>,
    getCanvasForMeasure?: () => any
  ) => TextMeasure<ITextAttribute>;
  drawGraphicToCanvas: (
    graphic: IGraphic,
    stage: IStage
  ) => HTMLCanvasElement | null | Promise<HTMLCanvasElement | null>;
}

interface TransformType {
    x: number, y: number,
    scaleX: number, scaleY: number,
    // shearMatrix is the matrix of shear transformation (if there is shear transformation)
    angle: number, shearMatrix?: Matrix
}

interface Transform {
  // Provide the initial transformation configuration
  init: (origin: TransformType) => Transform;
  translate: (x: number, y: number) => Transform;
  translateTo: (x: number, y: number) => Transform;
  scale: (sx: number, sy: number, center: IPoint) => Transform;
  scaleTo: (sx: number, sy: number, center: IPoint) => Transform;
  rotate: (angle: number, center: IPoint) => Transform;
  rotateTo: (angle: number, center: IPoint) => Transform;
  // Syntactic sugar, can be used for interaction, passing in the change data each time
  interactive: (dx: number, dy: number, dsx: number, dsy: number, drx: number, dry: number) => Transform;
  // Extend padding pixels for outer stroke, inner stroke
  extend: (origin: TransformType, padding: number) => Transform;
  // Generate all transforms into one transform
  simplify: (target?: TransformType) => TransformType;
}
```
