import { BaseEnvContribution } from '@visactor/vrender-core';
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

interface ITaro {
  createCanvasContext: (id: string) => any;
  canvasGetImageData: (data: {
    canvasId: string;
    x: number;
    y: number;
    width: number;
    height: number;
    success: (res: any) => void;
  }) => any;
}

type TaroEnvParams = MiniAppCanvasEnvParams & {
  taro?: ITaro;
};

const TARO_CANVAS_BRIDGE_ERROR =
  'Taro canvas bridge is unavailable. VRender taro env requires envParams.canvasFactory, ' +
  'a Stage canvas object, or envParams.taro.createCanvasContext(id).';

export class TaroEnvContribution extends BaseEnvContribution implements IEnvContribution {
  type: EnvType = 'taro';
  supportEvent: boolean = true;
  canvasMap: Map<string, ITTCanvas> = new Map();
  taro: ITaro;
  pixelRatio: number = 1;
  private taroEnvParams: TaroEnvParams = {};

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

  mapToCanvasPoint(event: any) {
    if (event?.type?.startsWith('mouse')) {
      return event;
    }
    return event;
  }

  configure(service: IGlobal, params: TaroEnvParams = {}) {
    if (service.env === this.type) {
      service.setActiveEnvContribution(this);
      this.taroEnvParams = params;
      this.taro = params.taro;
      this.pixelRatio = params.pixelRatio ?? 1;

      // loadTaroContributions();
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

  loadSvg(svgStr: string): Promise<{
    loadState: 'success' | 'fail';
    data: HTMLImageElement | ImageData | null;
  }> {
    const _window = typeof window !== 'undefined' ? window : globalThis;
    if (_window.DOMParser) {
      const parser = new _window.DOMParser();
      const svg = parser.parseFromString(svgStr, 'image/svg+xml').children[0];
      const data = new XMLSerializer().serializeToString(svg);
      const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(data)}`; //svg转base64

      return Promise.resolve({
        data: url as unknown as HTMLImageElement,
        loadState: 'success'
      });
    } else if (_window.Blob) {
      const data = new _window.Blob([svgStr], { type: 'image/svg+xml' });
      const url = _window.URL.createObjectURL(data);

      return Promise.resolve({
        data: url as unknown as HTMLImageElement,
        loadState: 'success'
      });
    }
    // 目前移动端上小程序不支持DOMParser和Blob，无法解析svg字符串，可以通过url使用svg资源
    return Promise.reject();
  }

  createCanvas(params: ICreateCanvasParams): ITTCanvas {
    const envParams = this.taroEnvParams;
    const dpr = params.dpr ?? this.getDevicePixelRatio();
    const factoryCanvas = createCanvasWithFactory(params, dpr, this.canvasMap, envParams.canvasFactory);
    if (factoryCanvas) {
      return factoryCanvas;
    }

    const options = getMiniAppCanvasOptions(params, dpr, false);
    if (options.id == null || typeof envParams.taro?.createCanvasContext !== 'function') {
      throw new Error(TARO_CANVAS_BRIDGE_ERROR);
    }

    const canvas = wrapMiniAppContextCanvas(envParams.taro.createCanvasContext(options.id), options);
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
    return this.pixelRatio;
  }

  getRequestAnimationFrame(): (callback: FrameRequestCallback) => number {
    return requestAnimationFrame;
  }

  getCancelAnimationFrame(): (h: number) => void {
    return cancelAnimationFrame;
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
