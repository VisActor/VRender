import { injectable, BaseEnvContribution, rafBasedSto } from '@visactor/vrender-core';
// import { loadFeishuContributions } from '../../../kits';
import type {
  ICanvasLike,
  EnvType,
  ICreateCanvasParams,
  IEnvContribution,
  IGlobal,
  ITTCanvas
} from '@visactor/vrender-core';

declare const wx: {
  getSystemInfoSync: () => { pixelRatio: number };
  createCanvasContext: (id: string) => any;
  createSelectorQuery: () => any;
};

// 飞书小程序canvas的wrap
async function makeUpCanvas(
  domref: any,
  canvasIdLists: string[],
  canvasMap: Map<string, ITTCanvas>,
  freeCanvasIdx: number,
  freeCanvasList: ITTCanvas[],
  component: any
) {
  const dpr = wx.getSystemInfoSync().pixelRatio;

  for (let i = 0; i < canvasIdLists.length; i++) {
    const id = canvasIdLists[i];
    if (canvasMap.has(id)) {
      continue;
    }
    await new Promise(resolve => {
      let data = wx.createSelectorQuery();
      if (component) {
        data = data.in(component);
      }
      // @ts-ignore
      data
        .select(`#${id}`) // 在 WXML 中填入的 id
        .fields({ node: true, size: true })
        .exec((res: any) => {
          if (!res[0]) {
            return;
          }
          const canvas = res[0].node;
          const width = res[0].width;
          const height = res[0].height;
          canvas.width = width * dpr;
          canvas.height = height * dpr;
          canvasMap.set(id, canvas);
          if (i >= freeCanvasIdx) {
            freeCanvasList.push(canvas);
          }
          resolve(null);
        });
    });
  }

  // canvasIdLists.forEach((id, i) => {
  //   const ctx = wx.createCanvasContext(id);
  //   // TODO: 这里是一个临时方案，向 ctx 内部构造一个 canvas，传递宽高
  //   ctx.canvas = {
  //     width: domref.width * dpr,
  //     height: domref.height * dpr
  //   };

  //   // 放到内容里
  //   // // TODO: 这里是一个临时方案，兼容 createCircularGradient 方法
  //   // ctx.createRadialGradient = (...cc) => ctx.createCircularGradient(...cc);

  //   // // 封装 getImageData 为 promise
  //   // ctx.getImageData = (x, y, width, height) =>
  //   //   new Promise((resolve, reject) => {
  //   //     try {
  //   //       tt.canvasGetImageData({
  //   //         canvasId: item.id,
  //   //         x,
  //   //         y,
  //   //         width,
  //   //         height,
  //   //         success(res) {
  //   //           resolve(res);
  //   //         },
  //   //       });
  //   //     } catch (err) {
  //   //       reject(err);
  //   //     }
  //   //   });

  //   const canvas = {
  //     width: domref.width,
  //     height: domref.height,
  //     offsetWidth: domref.width,
  //     offsetHeight: domref.height,
  //     id: id ?? '',
  //     getContext: () => ctx,
  //     // 构造 getBoundingClientRect 方法
  //     getBoundingClientRect: () => ({
  //       height: domref.height,
  //       width: domref.width
  //     })
  //   };

  //   canvasMap.set(id, canvas);
  //   if (i >= freeCanvasIdx) {
  //     freeCanvasList.push(canvas);
  //   }
  // });
}

@injectable()
export class WxEnvContribution extends BaseEnvContribution implements IEnvContribution {
  type: EnvType = 'wx';
  supportEvent: boolean = true;
  // 所有添加进来的canvas
  canvasMap: Map<string, ITTCanvas> = new Map();
  // 所有可用的canvasList
  freeCanvasList: ITTCanvas[] = [];
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
  configure(service: IGlobal, params: { domref: any; canvasIdLists: string[]; freeCanvasIdx: number; component: any }) {
    if (service.env === this.type) {
      service.setActiveEnvContribution(this);
      return makeUpCanvas(
        params.domref,
        params.canvasIdLists,
        this.canvasMap,
        params.freeCanvasIdx,
        this.freeCanvasList,
        params.component
      ).then(() => {
        // loadFeishuContributions();
      });
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
    return wx.getSystemInfoSync().pixelRatio;
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
