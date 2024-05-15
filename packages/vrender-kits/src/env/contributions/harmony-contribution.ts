import { injectable, BaseEnvContribution, RafBasedSTO } from '@visactor/vrender-core';
// import { loadFeishuContributions } from '../../../kits';
import type {
  ICanvasLike,
  EnvType,
  ICreateCanvasParams,
  IEnvContribution,
  IGlobal,
  ILynxCanvas
} from '@visactor/vrender-core';
import { CanvasWrapDisableWH, CanvasWrapEnableWH } from './canvas-wrap';

function createCanvas(width: number, height: number, id?: string) {
  // const context = new (OffscreenCanvasRenderingContext2D as any)(width, height);
  // 浏览器debug
  const _c = new OffscreenCanvas(width, height);
  const context = _c.getContext('2d');

  const nativeCanvas = {
    width,
    height,
    context,
    _c,
    getBoundingClientRect() {
      return {
        width,
        height
      };
    },
    getContext() {
      return context;
    }
  };
  return new CanvasWrapDisableWH(nativeCanvas, context, 1, width, height, id);
}

@injectable()
export class HarmonyEnvContribution extends BaseEnvContribution implements IEnvContribution {
  type: EnvType = 'harmony';
  supportEvent: boolean = true;
  rafSTO: RafBasedSTO;

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
  configure(
    service: IGlobal,
    params: { domref: any; canvasIdLists: string[]; freeCanvasIdx: number; offscreen?: boolean; pixelRatio?: number }
  ) {
    if (service.env === this.type) {
      service.setActiveEnvContribution(this);

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
    return;
  }

  loadSvg(url: string): Promise<{
    loadState: 'success' | 'fail';
    data: HTMLImageElement | ImageData | null;
  }> {
    // 飞书小组件不支持DOMParser和URL.createObjectURL，无法解析svg字符串，可以通过url使用svg资源
    return Promise.reject();
  }

  createCanvas(params: ICreateCanvasParams): ILynxCanvas {
    return createCanvas(params.width, params.height, params.id);
  }

  createOffscreenCanvas(params: ICreateCanvasParams) {
    return;
  }

  releaseCanvas(canvas: ICanvasLike | string) {
    return;
  }

  getDevicePixelRatio(): number {
    return 1;
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
    return null;
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
