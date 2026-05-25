import {
  BaseEnvContribution,
  rafBasedSto,
  type EnvType,
  type ICanvasLike,
  type ICreateCanvasParams,
  type IEnvContribution,
  type IGlobal,
  type ILynxCanvas
} from '@visactor/vrender-core';
// import { loadFeishuContributions } from '../../../kits';
import { CanvasWrapEnableWH } from './canvas-wrap';

declare const lynx: {
  getSystemInfoSync: () => { pixelRatio: number };
  createCanvas: (id: string) => any;
  createCanvasNG: (id?: string) => any;
  createImage: (id: string) => any;
  createOffscreenCanvas: () => any;
  krypton?: {
    createCanvas?: (id: string) => any;
    createCanvasNG?: () => any;
    CanvasElement?: new (name: string) => any;
  };
};
declare const SystemInfo: {
  pixelRatio: number;
};

type LynxKryptonRuntime = Partial<{
  createCanvas: (id: string) => any;
  createCanvasNG: () => any;
  CanvasElement: new (name: string) => any;
}>;

type LynxRuntime = Partial<{
  getSystemInfoSync: () => { pixelRatio?: number };
  createCanvas: (id: string) => any;
  createCanvasNG: (id?: string) => any;
  createImage: (id: string) => any;
  createOffscreenCanvas: () => any;
  krypton: LynxKryptonRuntime;
}>;

type LynxCanvasFactoryOptions = {
  id: string;
  width: number;
  height: number;
  dpr: number;
  offscreen: boolean;
};

type LynxCanvasFactory = (options: LynxCanvasFactoryOptions) => any;

type LynxEnvParams = {
  pixelRatio?: number;
  lynx?: LynxRuntime;
  runtime?: LynxRuntime;
  canvasFactory?: LynxCanvasFactory;
};

const LYNX_CANVAS_BRIDGE_ERROR =
  'Lynx canvas bridge is unavailable. VRender Lynx env requires envParams.canvasFactory ' +
  'or a Lynx runtime that exposes createCanvasNG/createCanvas/createOffscreenCanvas/krypton canvas APIs.';
const LYNX_CANVAS_SIZE_ERROR =
  'Lynx canvas size is unavailable. Pass stage width/height when creating a Lynx stage canvas.';

function isValidCoordinate(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function pickCoordinate(...values: unknown[]): number | undefined {
  for (let i = 0; i < values.length; i++) {
    if (isValidCoordinate(values[i])) {
      return values[i] as number;
    }
  }
  return undefined;
}

function getPrimaryTouch(event: any) {
  return event?.changedTouches?.[0] ?? event?.touches?.[0];
}

function getLynxEventPoint(event: any) {
  const touch = getPrimaryTouch(event);
  const x = pickCoordinate(
    event?.x,
    event?.offsetX,
    event?.clientX,
    event?.pageX,
    touch?.x,
    touch?.offsetX,
    touch?.clientX,
    touch?.pageX
  );
  const y = pickCoordinate(
    event?.y,
    event?.offsetY,
    event?.clientY,
    event?.pageY,
    touch?.y,
    touch?.offsetY,
    touch?.clientY,
    touch?.pageY
  );

  return x == null || y == null ? null : { x, y };
}

function getGlobalLynxRuntime(): LynxRuntime | undefined {
  try {
    return typeof lynx !== 'undefined' ? lynx : undefined;
  } catch (err) {
    return undefined;
  }
}

function getGlobalSystemPixelRatio(): number | undefined {
  try {
    return typeof SystemInfo !== 'undefined' ? SystemInfo.pixelRatio : undefined;
  } catch (err) {
    return undefined;
  }
}

function getLynxRuntime(params?: LynxEnvParams): LynxRuntime | undefined {
  return params?.lynx ?? params?.runtime ?? getGlobalLynxRuntime();
}

function getLynxPixelRatio(params?: LynxEnvParams, runtime?: LynxRuntime): number {
  return params?.pixelRatio ?? runtime?.getSystemInfoSync?.()?.pixelRatio ?? getGlobalSystemPixelRatio() ?? 1;
}

function attachLynxCanvasToView(canvas: any, id: string) {
  canvas?.attachToCanvasView?.(id);
  return canvas;
}

function createBoundLynxCanvas(id: string, runtime?: LynxRuntime) {
  if (typeof runtime?.krypton?.createCanvas === 'function') {
    const canvas = runtime.krypton.createCanvas(id);
    if (canvas) {
      return canvas;
    }
  }

  if (typeof runtime?.createCanvasNG === 'function') {
    const canvas = runtime.createCanvasNG(id);
    if (canvas) {
      return attachLynxCanvasToView(canvas, id);
    }
  }

  if (typeof runtime?.krypton?.createCanvasNG === 'function') {
    const canvas = runtime.krypton.createCanvasNG();
    if (canvas) {
      return attachLynxCanvasToView(canvas, id);
    }
  }

  if (typeof runtime?.krypton?.CanvasElement === 'function') {
    return new runtime.krypton.CanvasElement(id);
  }

  if (typeof runtime?.createCanvas === 'function') {
    const canvas = runtime.createCanvas(id);
    if (canvas) {
      return canvas;
    }
  }

  return null;
}

function getCanvasSize(width?: number, height?: number) {
  if (!isValidCoordinate(width) || !isValidCoordinate(height)) {
    throw new Error(LYNX_CANVAS_SIZE_ERROR);
  }
  return { width, height };
}

function wrapLynxNativeCanvas(nativeCanvas: any, id: string, width: number, height: number, dpr: number) {
  nativeCanvas.width = width * dpr;
  nativeCanvas.height = height * dpr;

  const ctx = nativeCanvas.getContext('2d');
  return new CanvasWrapEnableWH(nativeCanvas, ctx, dpr, width, height, id);
}

function createLynxNativeCanvas(
  id: string,
  width: number,
  height: number,
  dpr: number,
  offscreen: boolean,
  params: LynxEnvParams,
  runtime?: LynxRuntime
) {
  if (params.canvasFactory) {
    return params.canvasFactory({
      id,
      width,
      height,
      dpr,
      offscreen
    });
  }

  if (offscreen) {
    if (typeof runtime?.createOffscreenCanvas === 'function') {
      return runtime.createOffscreenCanvas();
    }
  } else {
    const canvas = createBoundLynxCanvas(id, runtime);
    if (canvas) {
      return canvas;
    }
  }

  throw new Error(LYNX_CANVAS_BRIDGE_ERROR);
}

export function createImageElement(
  src: string,
  isSvg: boolean = false,
  runtime: LynxRuntime | undefined = getGlobalLynxRuntime()
): Promise<HTMLImageElement> {
  if (isSvg) {
    return Promise.reject();
  }
  if (typeof runtime?.createImage !== 'function') {
    return Promise.reject(new Error('Lynx image bridge is unavailable.'));
  }
  const img = runtime.createImage(src);
  // if (img.complete) {
  //   return Promise.resolve(img);
  // }
  const promise: Promise<HTMLImageElement> = new Promise((resolve, reject) => {
    img.onload = () => {
      resolve(img);
    };
    img.onerror = () => {
      reject(new Error('加载失败'));
    };
  });
  return promise;
}

export class LynxEnvContribution extends BaseEnvContribution implements IEnvContribution {
  type: EnvType = 'lynx';
  supportEvent: boolean = true;
  // 所有添加进来的canvas
  canvasMap: Map<string, ILynxCanvas> = new Map();
  // 所有可用的canvasList
  freeCanvasList: ILynxCanvas[] = [];
  canvasIdx: number = 0;
  private lynxRuntime?: LynxRuntime;
  private lynxEnvParams?: LynxEnvParams;

  constructor() {
    super();
    this.supportsTouchEvents = true;
    try {
      this.supportsPointerEvents = !!globalThis.PointerEvent;
      this.supportsMouseEvents = !!globalThis.MouseEvent;
    } catch (err) {
      this.supportsPointerEvents = false;
      this.supportsMouseEvents = false;
    }
    this.applyStyles = true;
  }

  // TODO：VGrammar在小程序环境会重复调用setEnv传入canvas，所以每次configure并不会释放
  // 这里等待后续和VGrammar沟通
  configure(service: IGlobal, params: LynxEnvParams = {}) {
    if (service.env === this.type) {
      service.setActiveEnvContribution(this);
      this.lynxEnvParams = params;
      this.lynxRuntime = getLynxRuntime(params);

      // loadFeishuContributions();
    }
  }
  /**
   * 获取动态canvas的数量，offscreenCanvas或者framebuffer
   */
  getDynamicCanvasCount(): number {
    return this.freeCanvasList.length;
  }

  /**
   * 获取静态canvas的数量，纯粹canvas
   */
  getStaticCanvasCount(): number {
    return 9999;
  }

  loadImage(url: string): Promise<{
    loadState: 'success' | 'fail';
    data: HTMLImageElement | ImageData | null;
  }> {
    const imagePromise = createImageElement(url, false, this.lynxRuntime);
    return imagePromise
      .then((img: HTMLImageElement) => {
        return {
          data: img,
          loadState: 'success' as const
        };
      })
      .catch(() => {
        return {
          data: null,
          loadState: 'fail'
        };
      });
  }

  loadSvg(url: string): Promise<{
    loadState: 'success' | 'fail';
    data: HTMLImageElement | ImageData | null;
  }> {
    // Lynx 不支持 DOMParser 和 URL.createObjectURL，无法解析 svg 字符串，可以通过 url 使用 svg 资源
    return Promise.resolve({
      data: null,
      loadState: 'fail'
    });
  }

  createCanvas(params: ICreateCanvasParams): ILynxCanvas {
    if (params.id != null) {
      const id = String(params.id);
      const existing = this.canvasMap.get(id);
      if (existing) {
        return existing;
      }
      const envParams = this.lynxEnvParams ?? {};
      const runtime = getLynxRuntime(envParams);
      const dpr = params.dpr ?? getLynxPixelRatio(envParams, runtime);
      const size = getCanvasSize(params.width, params.height);
      const nativeCanvas = createLynxNativeCanvas(id, size.width, size.height, dpr, false, envParams, runtime);
      const canvas = wrapLynxNativeCanvas(nativeCanvas, id, size.width, size.height, dpr);
      this.canvasMap.set(id, canvas);
      return canvas;
    }

    const result = this.freeCanvasList[this.canvasIdx] || this.freeCanvasList[this.freeCanvasList.length - 1];
    this.canvasIdx++;
    if (result) {
      return result;
    }

    const envParams = this.lynxEnvParams ?? {};
    const runtime = getLynxRuntime(envParams);
    const dpr = params.dpr ?? getLynxPixelRatio(envParams, runtime);
    const size = getCanvasSize(params.width, params.height);
    const id = Math.random().toString();
    const nativeCanvas = createLynxNativeCanvas(id, size.width, size.height, dpr, true, envParams, runtime);
    const canvas = wrapLynxNativeCanvas(nativeCanvas, id, size.width, size.height, dpr);
    this.canvasMap.set(id, canvas);
    this.freeCanvasList.push(canvas);
    return canvas;
  }

  createOffscreenCanvas(params: ICreateCanvasParams) {
    return;
  }

  releaseCanvas(canvas: ICanvasLike | string) {
    return;
  }

  getDevicePixelRatio(): number {
    return getLynxPixelRatio(undefined, this.lynxRuntime);
  }

  getRequestAnimationFrame(): (callback: FrameRequestCallback) => number {
    // return requestAnimationFrame;

    // 飞书小组件，在云文档浏览器环境中，没有requestAnimationFrame
    // 但是在小组件工作台环境和模拟器中正常
    // 反馈飞书修改，目前先使用setTimeout模拟，进行测试，飞书修复后替换回requestAnimationFrame
    // return function (callback: FrameRequestCallback) {
    //   return setTimeout(callback, 1000 / 60, true);
    // } as any;
    return function (callback: FrameRequestCallback) {
      return rafBasedSto.call(callback);
    } as any;
  }

  getCancelAnimationFrame(): (h: number) => void {
    return (h: number) => {
      rafBasedSto.clear(h);
    };
  }

  mapToCanvasPoint(event: any) {
    return getLynxEventPoint(event) ?? event;
  }

  addEventListener<K extends keyof DocumentEventMap>(
    type: K,
    listener: (this: Document, ev: DocumentEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions | undefined
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions | undefined
  ): void;
  addEventListener(type: unknown, listener: unknown, options?: unknown): void {
    return null;
  }

  removeEventListener<K extends keyof DocumentEventMap>(
    type: K,
    listener: (this: Document, ev: DocumentEventMap[K]) => any,
    options?: boolean | EventListenerOptions | undefined
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions | undefined
  ): void;
  removeEventListener(type: unknown, listener: unknown, options?: unknown): void {
    return null;
  }

  dispatchEvent(event: any): boolean {
    return null;
  }

  // 只能索引canvas
  getElementById(str: string): any | null {
    return this.canvasMap.get(str);
  }

  getRootElement(): HTMLElement | null {
    return null;
  }

  getDocument(): Document | null {
    return null;
  }

  release(...params: any): void {
    return;
  }
}
