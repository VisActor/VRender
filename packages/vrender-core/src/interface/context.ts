import type { Matrix, IMatrix, IBoundsLike, IPointLike } from '@visactor/vutils';
import type { ICamera } from './camera';
import type { ICanvas } from './canvas';
import type { Releaseable } from './common';
import type { mat4, vec3 } from './matrix';
import type { IFillType, IStrokeType, ITransform } from './graphic';

export interface IConicalGradientData {
  addColorStop: (pos: number, color: string) => void;
  readonly stops: [number, string][];
  GetPattern: (minW: number, minH: number, deltaAngle?: number) => CanvasPattern | null;
}

// 用于commonStyle函数的参数
export interface ICommonStyleParams {
  fill?: IFillType;
  fillOpacity?: number;
  shadowBlur?: number;
  shadowColor?: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  globalCompositeOperation?: CanvasRenderingContext2D['globalCompositeOperation'] | '';
  opacity?: number;
  blur?: number;
}

export interface IStrokeStyleParams {
  stroke?: IStrokeType | IStrokeType[];
  strokeOpacity?: number;
  lineDash?: number[];
  lineDashOffset?: number;
  lineWidth?: number;
  lineCap?: CanvasLineCap;
  lineJoin?: CanvasLineJoin;
  miterLimit?: number;
  opacity?: number;
  keepStrokeScale?: boolean;
}
export interface ITextStyleParams {
  font?: string;
  fontSize: number;
  fontFamily?: string;
  fontWeight?: string | number;
  textAlign?: CanvasTextAlign;
  textBaseline?: CanvasTextBaseline;
  scaleIn3d?: boolean;
}

export interface ISetCommonStyleParams {
  attribute: Partial<ICommonStyleParams & ITransform>;
  AABBBounds: IBoundsLike;
}

export interface ISetStrokeStyleParams {
  attribute: Partial<IStrokeStyleParams & ITransform>;
  AABBBounds: IBoundsLike;
}
export interface IContext2d extends Releaseable {
  stack: IMatrix[];
  inuse?: boolean;
  camera?: ICamera;
  modelMatrix?: mat4;
  drawPromise?: Promise<any>;
  baseGlobalAlpha?: number;
  // 属性代理
  fillStyle: string | CanvasGradient | CanvasPattern;
  disableFill?: boolean;
  disableStroke?: boolean;
  disableBeginPath?: boolean;
  /**
   * @deprecated font方法不建议使用，请使用setTextStyle
   */
  font: string;
  globalAlpha: number;
  lineCap: string;
  lineDashOffset: number;
  lineJoin: string;
  lineWidth: number;
  miterLimit: number;
  shadowBlur: number;
  shadowColor: string;
  shadowOffsetX: number;
  shadowOffsetY: number;
  strokeStyle: string | CanvasGradient | CanvasPattern;
  dpr: number;
  /**
   * @deprecated textAlign方法不建议使用，请使用setTextStyle
   */
  textAlign: string;
  /**
   * @deprecated textBaseline方法不建议使用，请使用setTextStyle
   */
  textBaseline: string;
  nativeContext: CanvasRenderingContext2D | any;
  canvas: ICanvas;
  [key: string]: any; //类型没有索引签名

  getCanvas: () => ICanvas;

  getContext: () => any;

  /**
   * 设置当前ctx 的transform信息
   */
  setTransformForCurrent: (force?: boolean) => void;
  /**
   * 获取当前矩阵信息
   */
  currentMatrix: IMatrix;

  /**
   * 清空画布
   */
  clear: () => void;

  restore: () => void;
  highPerformanceRestore: () => void;

  /**
   *
   * @param angle 弧度数
   */
  rotate: (angle: number, setTransform?: boolean) => void;

  save: () => void;
  highPerformanceSave: () => void;

  project?: (x: number, y: number, z?: number) => IPointLike;
  view?: (x: number, y: number, z?: number) => vec3;

  scale: (x: number, y: number, setTransform?: boolean) => void;

  scalePoint: (sx: number, sy: number, px: number, py: number, setTransform?: boolean) => void;
  transform: (
    m11: number,
    m12: number,
    m21: number,
    m22: number,
    dx: number,
    dy: number,
    setTransform?: boolean
  ) => void;
  transformFromMatrix: (matrix: Matrix, setTransform?: boolean) => void;
  setTransform: (
    m11: number,
    m12: number,
    m21: number,
    m22: number,
    dx: number,
    dy: number,
    setTransform?: boolean,
    dpr?: number
  ) => void;
  setTransformFromMatrix: (matrix: Matrix, setTransform?: boolean, dpr?: number) => void;

  resetTransform: (setTransform?: boolean, dpr?: number) => void;

  translate: (x: number, y: number, setTransform?: boolean) => void;
  /**
   * 旋转角度，自动转换为弧度
   * @param deg 角度数
   */
  rotateDegrees: (deg: number, setTransform?: boolean) => void;

  /**
   * 绕点旋转
   * @param rad 弧度
   * @param x 旋转中心点x
   * @param y 旋转中心点y
   */
  rotateAbout: (rad: number, x: number, y: number, setTransform?: boolean) => void;

  /**
   * 绕点旋转
   * @param deg 旋转角度
   * @param x 旋转中心点x
   * @param y 旋转中心点y
   */
  rotateDegreesAbout: (deg: number, x: number, y: number, setTransform?: boolean) => void;

  beginPath: () => void;

  clip: ((fillRule?: CanvasFillRule) => void) & ((path: Path2D, fillRule?: CanvasFillRule) => void);

  arc: (
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    anticlockwise?: boolean,
    z?: number
  ) => void;

  arcTo: (x1: number, y1: number, x2: number, y2: number, radius: number) => void;

  bezierCurveTo: (cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number) => void;

  closePath: () => void;

  ellipse: (
    x: number,
    y: number,
    radiusX: number,
    radiusY: number,
    rotation: number,
    startAngle: number,
    endAngle: number,
    anticlockwise?: boolean
  ) => void;

  lineTo: (x: number, y: number, z?: number) => void;

  moveTo: (x: number, y: number, z?: number) => void;

  quadraticCurveTo: (cpx: number, cpy: number, x: number, y: number, z?: number) => void;

  rect: (x: number, y: number, w: number, h: number, z?: number) => void;

  createImageData: (imageDataOrSw: number | ImageData, sh?: number) => ImageData;

  createLinearGradient: (x0: number, y0: number, x1: number, y1: number) => CanvasGradient;

  createPattern: (
    image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ICanvas | any,
    repetition: string
  ) => CanvasPattern | null;

  createRadialGradient: (x0: number, y0: number, r0: number, x1: number, y1: number, r1: number) => CanvasGradient;

  createConicGradient: (x: number, y: number, startAngle: number, endAngle: number) => IConicalGradientData | null;

  // createConicGradient: (x: number, y: number, startAngle: number, endAngle: number) => IConicalGradient | null;

  // fill(fillRule?: CanvasFillRule): void;
  fill: (path?: Path2D, fillRule?: CanvasFillRule) => void;

  fillRect: (x: number, y: number, w: number, h: number) => void;

  clearRect: (x: number, y: number, w: number, h: number) => void;

  fillText: (text: string, x: number, y: number, z?: number) => void;

  getImageData: (sx: number, sy: number, sw: number, sh: number) => ImageData;

  getLineDash: () => number[];

  isPointInPath: (x: number, y: number) => boolean;
  isPointInStroke: (x: number, y: number) => boolean;

  measureText: (text: string, method?: 'native' | 'simple' | 'quick') => { width: number };

  putImageData: (imagedata: ImageData, dx: number, dy: number) => void;

  setLineDash: (segments: number[]) => void;

  stroke: (path?: Path2D) => void;

  strokeRect: (x: number, y: number, w: number, h: number) => void;

  strokeText: (text: string, x: number, y: number, z?: number) => void;

  drawImage: ((
    image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ImageBitmap | ICanvas | any,
    dstX: number,
    dstY: number
  ) => void) &
    ((
      image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ImageBitmap | ICanvas | any,
      dstX: number,
      dstY: number,
      dstW: number,
      dstH: number
    ) => void) &
    ((
      image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ImageBitmap | ICanvas | any,
      srcX: number,
      srcY: number,
      srcW: number,
      srcH: number,
      dstX: number,
      dstY: number,
      dstW: number,
      dstH: number
    ) => void);

  setCommonStyle: (
    params: ISetCommonStyleParams,
    attribute: ICommonStyleParams,
    // 用于渐变色
    offsetX: number,
    offsetY: number,
    defultParams?: ICommonStyleParams | Partial<ICommonStyleParams>[]
  ) => void;

  setShadowBlendStyle?: (
    params: ISetCommonStyleParams,
    attribute: ICommonStyleParams,
    defultParams?: ICommonStyleParams | Partial<ICommonStyleParams>[]
  ) => void;

  setStrokeStyle: (
    params: ISetStrokeStyleParams,
    attribute: IStrokeStyleParams,
    // 用于渐变色
    offsetX: number,
    offsetY: number,
    defultParams?: Required<IStrokeStyleParams> | Partial<IStrokeStyleParams>[]
  ) => void;

  setTextStyle: (params: Partial<ITextStyleParams>, defaultParams?: ITextStyleParams, z?: number) => void;
  setTextStyleWithoutAlignBaseline: (
    params: Partial<ITextStyleParams>,
    defaultParams?: ITextStyleParams,
    z?: number
  ) => void;

  draw: (...params: any) => void;

  clearMatrix: (setTransform?: boolean, dpr?: number) => void;
  setClearMatrix: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  onlyTranslate: (dpr?: number) => boolean;
}

export interface IContextLike {
  // 属性代理
  fillStyle: string | CanvasGradient | CanvasPattern;
  /**
   * @deprecated font方法不建议使用，请使用setTextStyle
   */
  font: string;
  globalAlpha: number;
  lineCap: string;
  lineDashOffset: number;
  lineJoin: string;
  lineWidth: number;
  miterLimit: number;
  shadowBlur: number;
  shadowColor: string;
  shadowOffsetX: number;
  shadowOffsetY: number;
  strokeStyle: string | CanvasGradient | CanvasPattern;
  dpr: number;
  /**
   * @deprecated textAlign方法不建议使用，请使用setTextStyle
   */
  textAlign: string;
  /**
   * @deprecated textBaseline方法不建议使用，请使用setTextStyle
   */
  textBaseline: string;
  nativeContext: CanvasRenderingContext2D | any;
  [key: string]: any; //类型没有索引签名

  /**
   * 清空画布
   */
  clear: () => void;

  restore: () => void;

  save: () => void;

  // transform(m11: number, m12: number, m21: number, m22: number, dx: number, dy: number): void;

  translate: (x: number, y: number) => void;

  beginPath: () => void;

  clip: ((fillRule?: CanvasFillRule) => void) & ((path: Path2D, fillRule?: CanvasFillRule) => void);

  arc: (x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean) => void;

  arcTo: ((x1: number, y1: number, x2: number, y2: number, radius: number) => void) &
    ((x1: number, y1: number, x2: number, y2: number, radiusX: number, radiusY: number, rotation: number) => void);

  bezierCurveTo: (cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number) => void;

  closePath: () => void;

  ellipse: (
    x: number,
    y: number,
    radiusX: number,
    radiusY: number,
    rotation: number,
    startAngle: number,
    endAngle: number,
    anticlockwise?: boolean
  ) => void;

  lineTo: (x: number, y: number) => void;

  moveTo: (x: number, y: number) => void;

  quadraticCurveTo: (cpx: number, cpy: number, x: number, y: number) => void;

  rect: (x: number, y: number, w: number, h: number) => void;

  fill: (path?: Path2D, fillRule?: CanvasFillRule) => void;

  fillRect: (x: number, y: number, w: number, h: number) => void;

  clearRect: (x: number, y: number, w: number, h: number) => void;

  fillText: (text: string, x: number, y: number, maxWidth?: number) => void;

  getImageData: (sx: number, sy: number, sw: number, sh: number) => ImageData;

  getLineDash: () => number[];

  isPointInPath: (x: number, y: number) => boolean;
  isPointInStroke: (x: number, y: number) => boolean;

  measureText: (text: string, method?: 'native' | 'simple' | 'quick') => { width: number };

  putImageData: (
    imagedata: ImageData,
    dx: number,
    dy: number,
    dirtyX?: number,
    dirtyY?: number,
    dirtyWidth?: number,
    dirtyHeight?: number
  ) => void;

  setLineDash: (segments: number[]) => void;

  stroke: (path?: Path2D) => void;

  strokeRect: (x: number, y: number, w: number, h: number) => void;

  strokeText: (text: string, x: number, y: number, maxWidth?: number) => void;

  drawImage: ((
    image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ImageBitmap | any,
    dstX: number,
    dstY: number
  ) => void) &
    ((
      image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ImageBitmap | any,
      dstX: number,
      dstY: number,
      dstW: number,
      dstH: number
    ) => void) &
    ((
      image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ImageBitmap | any,
      srcX: number,
      srcY: number,
      srcW: number,
      srcH: number,
      dstX: number,
      dstY: number,
      dstW: number,
      dstH: number
    ) => void);

  clearMatrix: () => void;
  onlyTranslate: () => boolean;
}
