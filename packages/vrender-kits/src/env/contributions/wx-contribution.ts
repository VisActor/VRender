import {
  BaseEnvContribution,
  rafBasedSto,
  type ICanvasLike,
  type EnvType,
  type ICreateCanvasParams,
  type IEnvContribution,
  type IGlobal,
  type ITTCanvas
} from '@visactor/vrender-core';
import {
  createCanvasWithFactory,
  getMiniAppCanvasOptions,
  type MiniAppCanvasEnvParams,
  wrapMiniAppContextCanvas
} from './miniapp-canvas';
// import { loadFeishuContributions } from '../../../kits';

declare const wx: {
  getSystemInfoSync?: () => { pixelRatio: number };
  createCanvasContext?: (id: string) => any;
};

type WxEnvParams = MiniAppCanvasEnvParams & {
  wx?: typeof wx;
  runtime?: typeof wx;
};

const WX_CANVAS_BRIDGE_ERROR =
  'Wx canvas bridge is unavailable. VRender wx env requires envParams.canvasFactory, ' +
  'a Stage canvas object, or a wx runtime that exposes createCanvasContext(id).';

function getWxRuntime(params?: WxEnvParams): any {
  try {
    return params?.wx ?? params?.runtime ?? (typeof wx !== 'undefined' ? wx : undefined);
  } catch {
    return params?.wx ?? params?.runtime;
  }
}

function getWxPixelRatio(params?: WxEnvParams, runtime: any = getWxRuntime(params)): number {
  return params?.pixelRatio ?? runtime?.getSystemInfoSync?.()?.pixelRatio ?? 1;
}

export class WxEnvContribution extends BaseEnvContribution implements IEnvContribution {
  type: EnvType = 'wx';
  supportEvent: boolean = true;
  // 所有添加进来的canvas
  canvasMap: Map<string, ITTCanvas> = new Map();
  private wxEnvParams: WxEnvParams = {};

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

  configure(service: IGlobal, params: WxEnvParams = {}) {
    if (service.env === this.type) {
      service.setActiveEnvContribution(this);
      this.wxEnvParams = params;
      // loadFeishuContributions();
    }
  }

  loadImage(url: string): Promise<{
    loadState: 'success' | 'fail';
    data: HTMLImageElement | ImageData | null;
  }> {
    return Promise.resolve({
      data: url as unknown as HTMLImageElement,
      loadState: 'success'
    });
  }

  loadSvg(url: string): Promise<{
    loadState: 'success' | 'fail';
    data: HTMLImageElement | ImageData | null;
  }> {
    // 微信小程序不支持 DOMParser 和 URL.createObjectURL，无法解析 svg 字符串，可以通过 url 使用 svg 资源
    return Promise.resolve({
      data: null,
      loadState: 'fail'
    });
  }

  createCanvas(params: ICreateCanvasParams): ITTCanvas {
    const envParams = this.wxEnvParams;
    const runtime = getWxRuntime(envParams);
    const dpr = params.dpr ?? getWxPixelRatio(envParams, runtime);
    const factoryCanvas = createCanvasWithFactory(params, dpr, this.canvasMap, envParams.canvasFactory);
    if (factoryCanvas) {
      return factoryCanvas;
    }

    const options = getMiniAppCanvasOptions(params, dpr, false);
    if (options.id == null || typeof runtime?.createCanvasContext !== 'function') {
      throw new Error(WX_CANVAS_BRIDGE_ERROR);
    }

    const canvas = wrapMiniAppContextCanvas(runtime.createCanvasContext(options.id), options);
    this.canvasMap.set(options.id, canvas);
    return canvas;
  }

  createOffscreenCanvas(params: ICreateCanvasParams) {
    return;
  }

  releaseCanvas(canvas: ICanvasLike | string) {
    return;
  }

  getDevicePixelRatio(): number {
    return getWxPixelRatio(this.wxEnvParams);
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

  mapToCanvasPoint(event: any) {
    if (event?.type?.startsWith('mouse')) {
      return event;
    }
    return event;
  }
}
