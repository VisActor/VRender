# 跨端接口使用

本章节并不是开发中必须的，如果你的应用需要再不同环境中运行（nodejs，浏览器，小程序）。又不想自己去写兼容，比如获取dpr（devicePixelRatio），创建Canvas，或者想用一些工具函数，就可以阅读本章节。
VRender提供了一系列默认的接口，用于屏蔽跨端的影响，目前会支持`Browser`、`Node`、`feishu`、`tt`等环境，其余环境可以通过扩展支持。

## Global

Global是一个静态类，提供了全局的跨端API，用户可以直接拿Global当浏览器的window用，Global会自动提供跨平台的兼容

> Global需要手动设置env，不需要自行添加跨端方法
> 注意：node端使用node-canvas，Canopus不会自动引用，需要用户手动将node-canvas包传入

```ts
type IEnv = 'feishu' | 'tt' | 'browser' | 'node';

interface IDocument {
  createElement(t: 'canvas'): HTMLCanvasElement;
  createElement(t: string): HTMLElement;
}

export interface IGlobal {
  readonly env: IEnv;
  // 如果是nodejs环境，那么必传params
  setEnv: (env: IEnv, params: { canvasPkg?: { canvas: any; loadImage: any } }) => void;
  createCanvas: () => ICanvas;
  releaseCanvas: (canvas: ICanvas) => void;
  getImageData: (ctx?: IContext2d) => ImageData;
  // 加载图片
  loadImage: (url: string, type: 'Image' | 'ImageData') => HTMLImageElement | Image | ImageData;
  // RAF
  requestAnimationFrame: IRequestAnimationFrame;
  // 获取dpr
  devicePixelRatio: number;
  document: IDocument;
}
```

## GraphicUtil

与Global不同的是，GraphicUtil提供的是跨端方面以及图形方面的API，其中包括Transform API，MeasureText API

Transform模块是方便用户手动进行变换，基于一个已有的变换配置，变换到另一个空间

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
    // shearMatrix是剪切变换的矩阵（如果存在剪切变换的话）
    angle: number, shearMatrix?: Matrix
}

interface Transform {
  // 提供初始的变换配置
  init: (origin: TransformType) => Transform;
  translate: (x: number, y: number) => Transform;
  translateTo: (x: number, y: number) => Transform;
  scale: (sx: number, sy: number, center: IPoint) => Transform;
  scaleTo: (sx: number, sy: number, center: IPoint) => Transform;
  rotate: (angle: number, center: IPoint) => Transform;
  rotateTo: (angle: number, center: IPoint) => Transform;
  // 语法糖，交互的时候可用，每次传入这次的变化数据
  interactive: (dx: number, dy: number, dsx: number, dsy: number, drx: number, dry: number) => Transform;
  // 扩展padding像素，用于外描边，内描边
  extend: (origin: TransformType, padding: number) => Transform;
  // 将所有的transform生成为一次的transform
  simplify: (target?: TransformType) => TransformType;
}
```
