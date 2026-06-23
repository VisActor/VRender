import { BaseEnvContribution, rafBasedSto } from '@visactor/vrender-core';
// import { loadFeishuContributions } from '../../../kits';
import type {
  ICanvasLike,
  EnvType,
  ICreateCanvasParams,
  IEnvContribution,
  IGlobal,
  ITTCanvas
} from '@visactor/vrender-core';
import {
  createCanvasWithFactory,
  getMiniAppCanvasOptions,
  type MiniAppCanvasEnvParams,
  wrapMiniAppContextCanvas
} from './miniapp-canvas';

declare const tt: {
  getSystemInfoSync?: () => { pixelRatio: number };
  createCanvasContext?: (id: string) => any;
};

type FeishuEnvParams = MiniAppCanvasEnvParams & {
  tt?: typeof tt;
  feishu?: typeof tt;
  runtime?: typeof tt;
};

const FEISHU_CANVAS_BRIDGE_ERROR =
  'Feishu canvas bridge is unavailable. VRender feishu env requires envParams.canvasFactory, ' +
  'a Stage canvas object, or a feishu/tt runtime that exposes createCanvasContext(id).';

function getFeishuRuntime(params?: FeishuEnvParams): any {
  try {
    return params?.feishu ?? params?.tt ?? params?.runtime ?? (typeof tt !== 'undefined' ? tt : undefined);
  } catch {
    return params?.feishu ?? params?.tt ?? params?.runtime;
  }
}

function getFeishuPixelRatio(params?: FeishuEnvParams, runtime: any = getFeishuRuntime(params)): number {
  return params?.pixelRatio ?? runtime?.getSystemInfoSync?.()?.pixelRatio ?? 1;
}

export class FeishuEnvContribution extends BaseEnvContribution implements IEnvContribution {
  type: EnvType = 'feishu';
  supportEvent: boolean = true;
  // 所有添加进来的canvas
  canvasMap: Map<string, ITTCanvas> = new Map();
  private feishuEnvParams: FeishuEnvParams = {};

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

  /**
   * 获取动态canvas的数量，offscreenCanvas或者framebuffer
   */
  getDynamicCanvasCount(): number {
    return 0;
  }

  /**
   * 获取静态canvas的数量，纯粹canvas
   */
  getStaticCanvasCount(): number {
    return 9999;
  }

  configure(service: IGlobal, params: FeishuEnvParams = {}) {
    if (service.env === this.type) {
      service.setActiveEnvContribution(this);
      this.feishuEnvParams = params;

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
    // 飞书小组件不支持DOMParser和URL.createObjectURL，无法解析svg字符串，可以通过url使用svg资源
    return Promise.reject();
  }

  createCanvas(params: ICreateCanvasParams): ITTCanvas {
    const envParams = this.feishuEnvParams;
    const runtime = getFeishuRuntime(envParams);
    const dpr = params.dpr ?? getFeishuPixelRatio(envParams, runtime);
    const factoryCanvas = createCanvasWithFactory(params, dpr, this.canvasMap, envParams.canvasFactory);
    if (factoryCanvas) {
      return factoryCanvas;
    }

    const options = getMiniAppCanvasOptions(params, dpr, false);
    if (options.id == null || typeof runtime?.createCanvasContext !== 'function') {
      throw new Error(FEISHU_CANVAS_BRIDGE_ERROR);
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
    return getFeishuPixelRatio(this.feishuEnvParams);
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
