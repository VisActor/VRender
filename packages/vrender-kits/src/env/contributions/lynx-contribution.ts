import { injectable, BaseEnvContribution, rafBasedSto } from '@visactor/vrender-core';
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

declare const lynx: {
  getSystemInfoSync: () => { pixelRatio: number };
  createCanvas: (id: string) => any;
  createCanvasNG: (id: string) => any;
  createImage: (id: string) => any;
  createOffscreenCanvas: () => any;
};
declare const SystemInfo: {
  pixelRatio: number;
};

let ng = false;
try {
  ng = !!lynx.createCanvasNG;
} catch (err) {
  // do nothing
}

// 飞书小程序canvas的wrap
function makeUpCanvas(
  domref: any,
  canvasIdLists: string[],
  canvasMap: Map<string, ILynxCanvas>,
  freeCanvasIdx: number,
  freeCanvasList: ILynxCanvas[],
  offscreen: boolean,
  pixelRatio?: number
) {
  const dpr = pixelRatio ?? SystemInfo.pixelRatio;

  canvasIdLists.forEach((id, i) => {
    let _canvas;
    if (offscreen) {
      _canvas = lynx.createOffscreenCanvas();
    } else {
      _canvas = ng ? lynx.createCanvasNG(id) : lynx.createCanvas(id);
      ng && _canvas.attachToCanvasView(id);
    }

    _canvas.width = domref.width * dpr;
    _canvas.height = domref.height * dpr;

    const ctx = _canvas.getContext('2d');
    // TODO: 这里是一个临时方案，向 ctx 内部构造一个 canvas，传递宽高
    // ctx.canvas = {
    //   width: domref.width * dpr,
    //   height: domref.height * dpr
    // };

    const canvas = new CanvasWrapEnableWH(_canvas, ctx, dpr, domref.width, domref.height, id);

    canvasMap.set(id, canvas);
    if (i > freeCanvasIdx) {
      freeCanvasList.push(canvas);
    }
  });

  if (!freeCanvasList.length && lynx.createOffscreenCanvas) {
    const _canvas = lynx.createOffscreenCanvas();
    _canvas.width = domref.width * dpr;
    _canvas.height = domref.height * dpr;
    const ctx = _canvas.getContext('2d');

    const id = Math.random().toString();
    const canvas = new CanvasWrapEnableWH(_canvas, ctx, dpr, domref.width, domref.height, id);
    canvasMap.set(id, canvas);
    freeCanvasList.push(canvas);
  }
}

export function createImageElement(src: string, isSvg: boolean = false): Promise<HTMLImageElement> {
  if (isSvg) {
    return Promise.reject();
  }
  const img = lynx.createImage(src);
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

@injectable()
export class LynxEnvContribution extends BaseEnvContribution implements IEnvContribution {
  type: EnvType = 'lynx';
  supportEvent: boolean = true;
  // 所有添加进来的canvas
  canvasMap: Map<string, ILynxCanvas> = new Map();
  // 所有可用的canvasList
  freeCanvasList: ILynxCanvas[] = [];
  canvasIdx: number = 0;

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
  configure(
    service: IGlobal,
    params: { domref: any; canvasIdLists: string[]; freeCanvasIdx: number; offscreen?: boolean; pixelRatio?: number }
  ) {
    if (service.env === this.type) {
      service.setActiveEnvContribution(this);
      makeUpCanvas(
        params.domref,
        params.canvasIdLists,
        this.canvasMap,
        params.freeCanvasIdx,
        this.freeCanvasList,
        !!params.offscreen,
        params.pixelRatio
      );

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
    const imagePromise = createImageElement(url, false);
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
    // 飞书小组件不支持DOMParser和URL.createObjectURL，无法解析svg字符串，可以通过url使用svg资源
    return Promise.reject();
  }

  createCanvas(params: ICreateCanvasParams): ILynxCanvas {
    const result = this.freeCanvasList[this.canvasIdx] || this.freeCanvasList[this.freeCanvasList.length - 1];
    this.canvasIdx++;
    return result;
  }

  createOffscreenCanvas(params: ICreateCanvasParams) {
    return;
  }

  releaseCanvas(canvas: ICanvasLike | string) {
    return;
  }

  getDevicePixelRatio(): number {
    return SystemInfo.pixelRatio;
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
    if (event?.type?.startsWith('mouse')) {
      return event;
    }
    return event;
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
