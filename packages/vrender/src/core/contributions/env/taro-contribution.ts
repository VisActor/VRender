import { injectable } from 'inversify';
import { loadTaroContributions } from '../../../kits';
import type {
  ICanvasLike,
  EnvType,
  ICreateCanvasParams,
  IEnvContribution,
  IGlobal,
  IDomRef,
  ITTCanvas
} from '../../../interface';
import { BaseEnvContribution } from './base-contribution';
import { createImageElement } from './browser-contribution';

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

function makeUpCanvas(
  domref: IDomRef,
  canvasIdLists: string[],
  canvasMap: Map<string, ITTCanvas>,
  freeCanvasIdx: number,
  freeCanvasList: ITTCanvas[],
  taro: ITaro,
  dpr: number
) {
  canvasIdLists.forEach((id, i) => {
    const ctx: any = taro.createCanvasContext(id);
    // TODO: 这里是一个临时方案，向 ctx 内部构造一个 canvas，传递宽高
    ctx.canvas = {
      width: domref.width * dpr,
      height: domref.height * dpr
    };

    // TODO: 这里是一个临时方案，兼容 createCircularGradient 方法
    if (!ctx.createRadialGradient) {
      ctx.createRadialGradient = (...cc: any) => ctx.createCircularGradient(...cc);
    }

    // HACK: 小程序端draw、getImage方法为异步回调, 在此统一封装 getImageData 为 promise
    if (!ctx.getImageData && taro.canvasGetImageData) {
      ctx.getImageData = (x: number, y: number, width: number, height: number) =>
        new Promise((resolve, reject) => {
          try {
            taro.canvasGetImageData({
              canvasId: id,
              x,
              y,
              width,
              height,
              success(res) {
                resolve(res);
              }
            });
          } catch (err) {
            reject(err);
          }
        });
    }

    const canvas = {
      id: id,
      width: domref.width * dpr,
      height: domref.height * dpr,
      offsetWidth: domref.width,
      offsetHeight: domref.height,
      getContext: () => ctx,
      // 构造 getBoundingClientRect 方法
      getBoundingClientRect: () => ({
        height: domref.height,
        width: domref.width
      })
    };

    canvasMap.set(id, canvas);
    if (i >= freeCanvasIdx) {
      freeCanvasList.push(canvas);
    }

    return canvas;
  });
}

interface IConfigureParams {
  domref: any;
  canvasIdLists: string[];
  freeCanvasIdx: number;
  taro: ITaro;
  pixelRatio: number; // taro需要小程序自己处理pixelRatio
}

@injectable()
export class TaroEnvContribution extends BaseEnvContribution implements IEnvContribution {
  type: EnvType = 'taro';
  supportEvent: boolean = true;
  canvasMap: Map<string, ITTCanvas> = new Map();
  freeCanvasList: ITTCanvas[] = [];
  canvasIdx: number = 0;
  taro: ITaro;
  pixelRatio: number;

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
  configure(service: IGlobal, params: IConfigureParams) {
    if (service.env === this.type) {
      service.setActiveEnvContribution(this);
      makeUpCanvas(
        params.domref,
        params.canvasIdLists,
        this.canvasMap,
        params.freeCanvasIdx,
        this.freeCanvasList,
        params.taro,
        params.pixelRatio
      );
      this.taro = params.taro;
      this.pixelRatio = params.pixelRatio;

      loadTaroContributions();
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
    const _window = window || globalThis;
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
    // params不生效
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
