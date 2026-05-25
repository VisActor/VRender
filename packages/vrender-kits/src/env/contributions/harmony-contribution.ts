import { BaseEnvContribution, RafBasedSTO } from '@visactor/vrender-core';
// import { loadFeishuContributions } from '../../../kits';
import type {
  ICanvasLike,
  EnvType,
  ICreateCanvasParams,
  IEnvContribution,
  IGlobal,
  ILynxCanvas
} from '@visactor/vrender-core';
import { CanvasWrapEnableWH } from './canvas-wrap';

type HarmonyCanvasFactoryOptions = {
  id: string;
  width: number;
  height: number;
  dpr: number;
  offscreen: boolean;
};

type HarmonyCanvasFactory = (options: HarmonyCanvasFactoryOptions) => any;

type HarmonyRuntime = Partial<{
  createCanvas: (options: HarmonyCanvasFactoryOptions) => any;
  createOffscreenCanvas: (options: HarmonyCanvasFactoryOptions) => any;
  createImage: (src: string) => any;
}>;

type HarmonyEnvParams = {
  pixelRatio?: number;
  harmony?: HarmonyRuntime;
  runtime?: HarmonyRuntime;
  canvasFactory?: HarmonyCanvasFactory;
};

const HARMONY_CANVAS_BRIDGE_ERROR =
  'Harmony canvas bridge is unavailable. VRender Harmony env requires envParams.canvasFactory ' +
  'or a Harmony runtime that exposes a global createCanvas/createOffscreenCanvas capability.';
const HARMONY_CANVAS_SIZE_ERROR =
  'Harmony canvas size is unavailable. Pass stage width/height when creating a Harmony stage canvas.';

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

function getHarmonyEventPoint(event: any) {
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

function getHarmonyRuntime(params?: HarmonyEnvParams): HarmonyRuntime | undefined {
  return params?.harmony ?? params?.runtime;
}

function getHarmonyPixelRatio(params?: HarmonyEnvParams): number {
  return params?.pixelRatio ?? 1;
}

function getCanvasSize(width?: number, height?: number) {
  if (!isValidCoordinate(width) || !isValidCoordinate(height)) {
    throw new Error(HARMONY_CANVAS_SIZE_ERROR);
  }
  return { width, height };
}

function getGlobalOffscreenCanvasCtor() {
  try {
    return typeof OffscreenCanvas !== 'undefined' ? OffscreenCanvas : undefined;
  } catch (err) {
    return undefined;
  }
}

function createFallbackOffscreenCanvas(width: number, height: number) {
  const OffscreenCanvasCtor = getGlobalOffscreenCanvasCtor();
  if (typeof OffscreenCanvasCtor !== 'function') {
    return null;
  }
  return new OffscreenCanvasCtor(width, height);
}

function wrapHarmonyNativeCanvas(nativeCanvas: any, id: string, width: number, height: number, dpr: number) {
  nativeCanvas.width = width * dpr;
  nativeCanvas.height = height * dpr;
  const context = nativeCanvas.getContext?.('2d') ?? nativeCanvas.getContext?.();
  if (!context) {
    throw new Error(HARMONY_CANVAS_BRIDGE_ERROR);
  }
  if (typeof nativeCanvas.getBoundingClientRect !== 'function') {
    nativeCanvas.getBoundingClientRect = () => ({
      width,
      height
    });
  }
  return new CanvasWrapEnableWH(nativeCanvas, context, dpr, width, height, id);
}

function createHarmonyNativeCanvas(
  id: string,
  width: number,
  height: number,
  dpr: number,
  offscreen: boolean,
  params: HarmonyEnvParams,
  runtime?: HarmonyRuntime
) {
  const options = {
    id,
    width,
    height,
    dpr,
    offscreen
  };

  if (params.canvasFactory) {
    return params.canvasFactory(options);
  }

  if (offscreen && typeof runtime?.createOffscreenCanvas === 'function') {
    const canvas = runtime.createOffscreenCanvas(options);
    if (canvas) {
      return canvas;
    }
  }

  if (!offscreen && typeof runtime?.createCanvas === 'function') {
    const canvas = runtime.createCanvas(options);
    if (canvas) {
      return canvas;
    }
  }

  if (offscreen) {
    const canvas = createFallbackOffscreenCanvas(width * dpr, height * dpr);
    if (canvas) {
      return canvas;
    }
  }

  throw new Error(HARMONY_CANVAS_BRIDGE_ERROR);
}

export class HarmonyEnvContribution extends BaseEnvContribution implements IEnvContribution {
  type: EnvType = 'harmony';
  supportEvent: boolean = true;
  rafSTO: RafBasedSTO;
  canvasMap: Map<string, ILynxCanvas> = new Map();
  freeCanvasList: ILynxCanvas[] = [];
  canvasIdx: number = 0;
  private harmonyRuntime?: HarmonyRuntime;
  private harmonyEnvParams?: HarmonyEnvParams;

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
    this.rafSTO = new RafBasedSTO(0);
  }

  // TODO：VGrammar在小程序环境会重复调用setEnv传入canvas，所以每次configure并不会释放
  // 这里等待后续和VGrammar沟通
  configure(service: IGlobal, params: HarmonyEnvParams = {}) {
    if (service.env === this.type) {
      service.setActiveEnvContribution(this);
      this.harmonyEnvParams = params;
      this.harmonyRuntime = getHarmonyRuntime(params);

      // loadFeishuContributions();
    }
  }
  /**
   * 获取动态canvas的数量，offscreenCanvas或者framebuffer
   */
  getDynamicCanvasCount(): number {
    return 9999;
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
    if (typeof this.harmonyRuntime?.createImage !== 'function') {
      return Promise.resolve({
        data: null,
        loadState: 'fail'
      });
    }
    const img = this.harmonyRuntime.createImage(url);
    return new Promise(resolve => {
      img.onload = () => {
        resolve({
          data: img,
          loadState: 'success'
        });
      };
      img.onerror = () => {
        resolve({
          data: null,
          loadState: 'fail'
        });
      };
    });
  }

  loadSvg(url: string): Promise<{
    loadState: 'success' | 'fail';
    data: HTMLImageElement | ImageData | null;
  }> {
    return Promise.resolve({
      data: null,
      loadState: 'fail'
    });
  }

  createCanvas(params: ICreateCanvasParams): ILynxCanvas {
    const envParams = this.harmonyEnvParams ?? {};
    const runtime = getHarmonyRuntime(envParams);
    const dpr = params.dpr ?? getHarmonyPixelRatio(envParams);
    const size = getCanvasSize(params.width, params.height);

    if (params.id != null) {
      const id = String(params.id);
      const existing = this.canvasMap.get(id);
      if (existing) {
        return existing;
      }
      const nativeCanvas = createHarmonyNativeCanvas(id, size.width, size.height, dpr, false, envParams, runtime);
      const canvas = wrapHarmonyNativeCanvas(nativeCanvas, id, size.width, size.height, dpr);
      this.canvasMap.set(id, canvas);
      return canvas;
    }

    const result = this.freeCanvasList[this.canvasIdx] || this.freeCanvasList[this.freeCanvasList.length - 1];
    this.canvasIdx++;
    if (result) {
      return result;
    }

    const id = Math.random().toString();
    const nativeCanvas = createHarmonyNativeCanvas(id, size.width, size.height, dpr, true, envParams, runtime);
    const canvas = wrapHarmonyNativeCanvas(nativeCanvas, id, size.width, size.height, dpr);
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
    return getHarmonyPixelRatio(this.harmonyEnvParams);
  }

  getRequestAnimationFrame(): (callback: FrameRequestCallback) => number {
    // return requestAnimationFrame;

    // 飞书小组件，在云文档浏览器环境中，没有requestAnimationFrame
    // 但是在小组件工作台环境和模拟器中正常
    // 反馈飞书修改，目前先使用setTimeout模拟，进行测试，飞书修复后替换回requestAnimationFrame
    // return function (callback: FrameRequestCallback) {
    //   return setTimeout(callback, 1000 / 60, true);
    // } as any;
    return (callback: FrameRequestCallback) => {
      return this.rafSTO.call(callback);
    };
  }

  getCancelAnimationFrame(): (h: number) => void {
    return (h: number) => {
      this.rafSTO.clear(h);
    };
  }

  mapToCanvasPoint(event: any) {
    return getHarmonyEventPoint(event) ?? event;
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
    return this.canvasMap.get(str) ?? null;
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
