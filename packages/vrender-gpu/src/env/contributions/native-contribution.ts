import { injectable } from 'inversify';
import type { EnvType, IEnvContribution, IGlobal, ICreateCanvasParams, ICanvas } from '@visactor/vrender';
import { BaseEnvContribution, Generator } from '@visactor/vrender';
import fetch from 'node-fetch';
import { Resvg } from '@resvg/resvg-js';
import { NativeCanvas } from '../../canvas/native-canvas';

let last = 0;
function nodeRequestAnimationFrame(callback: FrameRequestCallback) {
  const now = Date.now();
  const timeLeft = Math.max(0, 16 - (now - last));
  const id = setTimeout(function () {
    callback(now + timeLeft);
  }, timeLeft);
  last = now + timeLeft;
  return id;
}

type NativePkg = any;

@injectable()
export class NativeEnvContribution extends BaseEnvContribution implements IEnvContribution {
  type: EnvType = 'native';
  pkg: NativePkg;
  _lastTime: number = 0;
  supportEvent: boolean = false;

  configure(service: IGlobal, pkg: NativePkg) {
    if (service.env === this.type) {
      service.setActiveEnvContribution(this);
      this.pkg = pkg;
    }
  }

  loadJson(url: string): Promise<{
    loadState: 'success' | 'fail';
    data: Record<string, unknown> | null;
  }> {
    const jsonPromise = fetch(url).then(data => data.json()) as Promise<any>; // ignore_security_alert
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
    const arrayBufferPromise = fetch(url).then(data => data.arrayBuffer()); // ignore_security_alert
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

  loadImage(url: string): Promise<{
    loadState: 'success' | 'fail';
    data: HTMLImageElement | null;
  }> {
    const { loadImage } = this.pkg;
    if (loadImage) {
      return loadImage(url)
        .then((image: any) => {
          const loadState: 'success' | 'fail' = image ? 'success' : 'fail';
          return {
            loadState,
            data: image as HTMLImageElement
          };
        })
        .catch(() => {
          return {
            loadState: 'fail',
            data: null
          } as any;
        });
    }
    return Promise.reject(new Error('node-canvas loadImage could not be found!'));
  }

  // 此处的
  loadSvg(svgStr: string): Promise<{
    loadState: 'success' | 'fail';
    data: HTMLImageElement | null;
  }> {
    // // eslint-disable-next-line @typescript-eslint/no-var-requires
    // const { Resvg } = require('@resvg/resvg-js');
    if (!Resvg) {
      return Promise.reject(new Error('@resvg/resvg-js svgParser could not be found!'));
    }
    const resvg = new Resvg(svgStr);
    const pngData = resvg.render().asPng();
    return this.loadImage(pngData as unknown as string);
  }

  createCanvas(params: any): ICanvas {
    const canvas = new NativeCanvas({
      nativeCanvas: null
    });
    return canvas;
  }

  releaseCanvas(canvas: ICanvas | any) {
    canvas.release && canvas.release();
    return;
  }

  getDevicePixelRatio(): number {
    return 0;
  }

  getRequestAnimationFrame(): (callback: FrameRequestCallback) => number {
    // return requestAnimationFrame;
    return nodeRequestAnimationFrame as any;
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
    return;
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
    return;
  }

  getElementById(str: string): HTMLElement | null {
    return null;
  }

  getRootElement(): HTMLElement | null {
    return null;
  }

  dispatchEvent(event: any): boolean {
    return;
  }

  getCancelAnimationFrame(): (h: number) => void {
    return;
  }

  release(...params: any): void {
    return;
  }

  createOffscreenCanvas(params: ICreateCanvasParams) {
    return;
  }
}
