import { injectable } from 'inversify';
import { Generator } from '../../../common/generator';
import { ICanvasLike, EnvType, ICreateCanvasParams, IEnvContribution } from '../../../interface';
import { BaseEnvContribution } from './base-contribution';
import { IPointLike, isValidNumber } from '@visactor/vutils';

export function createImageElement(src: string, isSvg: boolean = false): Promise<HTMLImageElement> {
  const img = document.createElement('img');
  img.crossOrigin = 'anonymous';
  if (isSvg) {
    const data = new Blob([src], { type: 'image/svg+xml' });
    src = window.URL.createObjectURL(data);
  }
  img.src = src;
  if (img.complete) {
    return Promise.resolve(img);
  }
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
export class BrowserEnvContribution extends BaseEnvContribution implements IEnvContribution {
  type: EnvType = 'browser';
  supportEvent: boolean = true;

  constructor() {
    super();
    try {
      this.supportsTouchEvents = 'ontouchstart' in globalThis;
      this.supportsPointerEvents = !!globalThis.PointerEvent;
      this.supportsMouseEvents = !!globalThis.MouseEvent;
    } catch (err) {
      this.supportsTouchEvents = false;
      this.supportsPointerEvents = false;
      this.supportsPointerEvents = false;
    }
    this.applyStyles = true;
  }

  mapToCanvasPoint(nativeEvent: PointerEvent | WheelEvent, domElement?: any): IPointLike {
    if (domElement) {
      const { clientX: x, clientY: y } = nativeEvent;
      const rect = domElement.getBoundingClientRect();
      const nativeCanvas = domElement.getNativeHandler?.().nativeCanvas;
      let scaleX;
      let scaleY;
      if (nativeCanvas) {
        scaleX = rect.width / nativeCanvas.offsetWidth;
        scaleY = rect.height / nativeCanvas.offsetHeight;
      }

      return {
        x: (x - rect.left) / (isValidNumber(scaleX) ? scaleX : 1),
        y: (y - rect.top) / (isValidNumber(scaleY) ? scaleX : 1)
      };
    }
    return {
      x: nativeEvent.offsetX,
      y: nativeEvent.offsetY
    };
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
    const imagePromise = createImageElement(url, true);
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

  createCanvas(params: ICreateCanvasParams): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    params.id && (canvas.id = params.id ?? Generator.GenAutoIncrementId().toString());
    // 默认dpr
    const dpr = params.dpr ?? window.devicePixelRatio;
    if (params.width && params.height) {
      canvas.style.width = `${params.width}px`;
      canvas.style.height = `${params.height}px`;
      canvas.width = params.width * dpr;
      canvas.height = params.height * dpr;
    }
    return canvas;
  }

  createOffscreenCanvas(params: ICreateCanvasParams) {
    const dpr = params.dpr ?? window.devicePixelRatio;
    const canvas = new OffscreenCanvas(params.width * dpr, params.height * dpr);
    return canvas;
  }

  releaseCanvas(canvas: ICanvasLike | string) {
    let c: HTMLCanvasElement | null;
    if (typeof canvas === 'string') {
      c = document.getElementById(canvas) as HTMLCanvasElement | null;
    } else {
      c = canvas as unknown as HTMLCanvasElement;
    }

    if (!c) {
      return;
    }
    if (c.parentElement) {
      c.parentElement.removeChild(c);
    }
  }

  getDevicePixelRatio(): number {
    return window.devicePixelRatio;
  }

  getRequestAnimationFrame(): (callback: FrameRequestCallback) => number {
    return window.requestAnimationFrame;
  }

  getCancelAnimationFrame(): (h: number) => void {
    return window.cancelAnimationFrame;
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
    return document.addEventListener(type as any, listener as any, options as any);
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
    return document.removeEventListener(type as any, listener as any, options as any);
  }

  dispatchEvent(event: any): boolean {
    return document.dispatchEvent(event);
  }

  getElementById(str: string): HTMLElement | null {
    return document.getElementById(str);
  }

  getRootElement(): HTMLElement | null {
    return document.body;
  }

  getDocument(): Document | null {
    return document;
  }

  release(...params: any): void {
    return;
  }
}
