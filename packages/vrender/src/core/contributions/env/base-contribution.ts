import { injectable } from 'inversify';
import { ICanvasLike, EnvType, ICreateCanvasParams, IEnvContribution, IGlobal } from '../../../interface';

@injectable()
export abstract class BaseEnvContribution implements IEnvContribution {
  type: EnvType;

  supportsTouchEvents: boolean;
  supportsPointerEvents: boolean;
  supportsMouseEvents: boolean;
  applyStyles: boolean;
  supportEvent: boolean;

  configure(service: IGlobal, ...p: any) {
    if (service.env === this.type) {
      service.setActiveEnvContribution(this);
    }
  }

  abstract loadImage(url: string): Promise<{
    loadState: 'success' | 'fail';
    data: HTMLImageElement | ImageData | null;
  }>;

  abstract loadSvg(url: string): Promise<{
    loadState: 'success' | 'fail';
    data: HTMLImageElement | ImageData | null;
  }>;

  abstract createCanvas(params: ICreateCanvasParams): ICanvasLike | any;
  abstract createOffscreenCanvas(params: ICreateCanvasParams): ICanvasLike | any;

  abstract releaseCanvas(canvas: ICanvasLike | string): void;

  abstract getDevicePixelRatio(): number;

  abstract getRequestAnimationFrame(): (callback: FrameRequestCallback) => number;
  abstract getCancelAnimationFrame(): (h: number) => void;

  abstract addEventListener<K extends keyof DocumentEventMap>(
    type: K,
    listener: (this: Document, ev: DocumentEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions | undefined
  ): void;
  abstract addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions | undefined
  ): void;
  abstract addEventListener(type: unknown, listener: unknown, options?: unknown): void;

  abstract removeEventListener<K extends keyof DocumentEventMap>(
    type: K,
    listener: (this: Document, ev: DocumentEventMap[K]) => any,
    options?: boolean | EventListenerOptions | undefined
  ): void;
  abstract removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions | undefined
  ): void;
  abstract removeEventListener(type: unknown, listener: unknown, options?: unknown): void;

  abstract dispatchEvent(event: any): boolean;

  getElementById(str: string): HTMLElement | null {
    return document.getElementById(str);
  }

  getRootElement(): HTMLElement | null {
    return document.body;
  }

  abstract release(...params: any): void;

  loadJson(url: string): Promise<{
    loadState: 'success' | 'fail';
    data: Record<string, unknown> | null;
  }> {
    const jsonPromise = fetch(url).then(data => data.json());
    jsonPromise
      .then(json => {
        return {
          data: json,
          state: 'success'
        };
      })
      .catch(() => {
        return {
          data: null,
          state: 'fail'
        };
      });
    return jsonPromise;
  }

  loadArrayBuffer(url: string): Promise<{
    loadState: 'success' | 'fail';
    data: ArrayBuffer | null;
  }> {
    const arrayBufferPromise = fetch(url).then(data => data.arrayBuffer());
    return arrayBufferPromise
      .then((arrayBuffer: ArrayBuffer) => {
        return {
          data: arrayBuffer,
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

  loadBlob(url: string): Promise<{
    loadState: 'success' | 'fail';
    data: Blob | null;
  }> {
    const blobPromise = fetch(url).then(data => data.blob());
    return blobPromise
      .then((blob: Blob) => {
        return {
          data: blob,
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
}
