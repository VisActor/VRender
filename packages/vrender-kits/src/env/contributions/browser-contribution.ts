import { injectable, Generator, BaseEnvContribution, application } from '@visactor/vrender-core';
import type {
  ICanvasLike,
  EnvType,
  ICreateCanvasParams,
  IEnvContribution,
  CreateDOMParamsType
} from '@visactor/vrender-core';
import type { IBoundsLike, IPointLike } from '@visactor/vutils';
import { AABBBounds, isString, isValidNumber } from '@visactor/vutils';

class DynamicB {
  get x1(): number {
    return this.dom.getBoundingClientRect().left;
  }
  get x2(): number {
    return this.dom.getBoundingClientRect().right;
  }
  get y1(): number {
    return this.dom.getBoundingClientRect().top;
  }
  get y2(): number {
    return this.dom.getBoundingClientRect().bottom;
  }
  get width(): number {
    return this.dom.getBoundingClientRect().width;
  }
  get height(): number {
    return this.dom.getBoundingClientRect().height;
  }

  dom: HTMLElement;

  constructor(dom: HTMLElement) {
    this.dom = dom;
  }
}

export function createImageElement(src: string, isSvg: boolean = false): Promise<HTMLImageElement> {
  const img = document.createElement('img');
  if (application.global.isImageAnonymous) {
    img.crossOrigin = 'anonymous';
  }
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

  mapToCanvasPoint(nativeEvent: PointerEvent | WheelEvent | TouchEvent, domElement?: any): IPointLike {
    let clientX: number = 0;
    let clientY: number = 0;
    let offsetX: number = 0;
    let offsetY: number = 0;
    if ((nativeEvent as TouchEvent).changedTouches) {
      const data = (nativeEvent as TouchEvent).changedTouches[0] ?? ({} as any);
      clientX = data.clientX || 0;
      clientY = data.clientY || 0;
      offsetX = clientX;
      offsetY = clientY;
    } else {
      clientX = (nativeEvent as PointerEvent | WheelEvent).clientX || 0;
      clientY = (nativeEvent as PointerEvent | WheelEvent).clientY || 0;
      offsetX = (nativeEvent as PointerEvent | WheelEvent).offsetX || 0;
      offsetY = (nativeEvent as PointerEvent | WheelEvent).offsetY || 0;
    }

    if (domElement) {
      const x = clientX;
      const y = clientY;
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
        y: (y - rect.top) / (isValidNumber(scaleY) ? scaleY : 1)
      };
    }
    return {
      x: offsetX,
      y: offsetY
    };
  }

  getNativeAABBBounds(_dom: any): IBoundsLike {
    let dom = _dom;
    if (typeof _dom === 'string') {
      dom = new DOMParser().parseFromString(_dom, 'text/html').firstChild;
      if ((dom as any).lastChild) {
        dom = (dom as any).lastChild.firstChild;
      }
    }
    if (dom.getBoundingClientRect) {
      const b = dom.getBoundingClientRect();
      return new DynamicB(b);
    }
    return new AABBBounds();
  }

  removeDom(dom: HTMLElement): boolean {
    dom.parentElement.removeChild(dom);
    return true;
  }

  updateDom(dom: HTMLElement, params: CreateDOMParamsType): boolean {
    const { width, height, style } = params;

    if (style) {
      if (isString(style)) {
        dom.setAttribute('style', style);
      } else {
        Object.keys(style).forEach(k => {
          dom.style[k] = style[k];
        });
      }
    }
    if (width != null) {
      dom.style.width = `${width}px`;
    }
    if (height != null) {
      dom.style.height = `${height}px`;
    }

    return true;
  }

  createDom(params: CreateDOMParamsType): HTMLElement | null {
    const { tagName = 'div', parent } = params;
    const element = document.createElement(tagName);

    this.updateDom(element, params);

    if (parent) {
      const pd = isString(parent) ? this.getElementById(parent) : parent;
      if (pd && pd.appendChild) {
        pd.appendChild(element);
      }
    }

    return element;
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

  getElementTop(element: HTMLElement, baseWindow?: boolean) {
    let actualTop = element.offsetTop;
    let current = element.offsetParent as HTMLElement;

    while (current !== null) {
      actualTop += current.offsetTop;
      current = current.offsetParent as HTMLElement;
    }

    return actualTop;
  }
  getElementLeft(element: HTMLElement, baseWindow?: boolean) {
    let actualLeft = element.offsetLeft;
    let current = element.offsetParent as HTMLElement;

    while (current !== null) {
      actualLeft += current.offsetLeft;
      current = current.offsetParent as HTMLElement;
    }

    return actualLeft;
  }
  getElementTopLeft(element: HTMLElement, baseWindow?: boolean): { top: number; left: number } {
    let actualTop = element.offsetTop;
    let actualLeft = element.offsetLeft;
    let current = element.offsetParent as HTMLElement;

    while (current !== null) {
      actualTop += current.offsetTop;
      actualLeft += current.offsetLeft;
      current = current.offsetParent as HTMLElement;
    }

    return {
      top: actualTop,
      left: actualLeft
    };
  }

  async loadFont(
    font: string,
    source: string | BinaryData,
    descriptors?: FontFaceDescriptors
  ): Promise<{ loadState: 'success' | 'fail' }> {
    // 创建字体实例
    const myFont = new FontFace(font, isString(source) ? `url(${source})` : source, descriptors);

    // 加载字体
    return myFont
      .load()
      .then(function (loadedFont) {
        // 将字体添加到文档中
        (document.fonts as any).add(loadedFont);
        return { loadState: 'success' } as { loadState: 'success' | 'fail' };
      })
      .catch(function (error) {
        console.error('Failed to load font:', error);
        return { loadState: 'fail' } as { loadState: 'success' | 'fail' };
      });
  }
}
