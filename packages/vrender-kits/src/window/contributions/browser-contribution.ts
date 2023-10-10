import {
  inject,
  injectable,
  Generator,
  BaseWindowHandlerContribution,
  VGlobal,
  ContainerModule,
  WindowHandlerContribution
} from '@visactor/vrender-core';
import type {
  IContext2d,
  ICanvas,
  IDomRectLike,
  EnvType,
  IGlobal,
  IWindowHandlerContribution,
  IWindowParams
} from '@visactor/vrender-core';
import type { IBoundsLike } from '@visactor/vutils';
import { BrowserCanvas } from '../../canvas/contributions/browser';

@injectable()
export class BrowserWindowHandlerContribution
  extends BaseWindowHandlerContribution
  implements IWindowHandlerContribution
{
  static env: EnvType = 'browser';

  type: EnvType = 'browser';

  canvas: ICanvas;

  observer?: MutationObserver;

  protected _canvasIsIntersecting: boolean;
  protected _onVisibleChangeCb: (currentVisible: boolean) => void;

  get container(): HTMLElement | null {
    return this.canvas.nativeCanvas.parentElement;
  }

  constructor(@inject(VGlobal) private readonly global: IGlobal) {
    super();
    this._canvasIsIntersecting = true;
  }

  getTitle(): string {
    return this.canvas.id.toString();
  }

  getWH(): { width: number; height: number } {
    return {
      width: this.canvas.width / (this.canvas.dpr || 1),
      height: this.canvas.height / (this.canvas.dpr || 1)
    };
  }

  getXY(): { x: number; y: number } {
    return this.canvas.nativeCanvas.getBoundingClientRect();
  }

  createWindow(params: IWindowParams): void {
    // 如果没有传入canvas，那么就创建一个canvas
    if (!params.canvas) {
      this.createWindowByConfig(params);
    } else {
      this.createWindowByCanvas(params);
    }

    this.postInit();

    // this.bindOnChangeEvent();
  }

  protected postInit() {
    try {
      this.observerCanvas();
    } catch (err) {
      console.error('发生错误，该环境不存在IntersectionObserver');
    }
  }

  isElementVisible(el: HTMLElement) {
    const rect = el.getBoundingClientRect();
    const vWidth = window.innerWidth || document.documentElement.clientWidth;
    const vHeight = window.innerHeight || document.documentElement.clientHeight;

    if (rect.right < 0 || rect.bottom < 0 || rect.left > vWidth || rect.top > vHeight) {
      return false;
    }

    return true;
  }

  protected observerCanvas() {
    this._canvasIsIntersecting = this.isElementVisible(this.canvas.nativeCanvas);
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (this._canvasIsIntersecting !== entry.isIntersecting) {
          this._canvasIsIntersecting = entry.isIntersecting;
          this._onVisibleChangeCb && this._onVisibleChangeCb(entry.isIntersecting);
        } else {
          this._canvasIsIntersecting = entry.isIntersecting;
        }
      });
    });
    if (!observer) {
      return;
    }
    observer.observe(this.canvas.nativeCanvas);
  }

  // private bindOnChangeEvent() {
  //   const { nativeCanvas } = this.canvas;
  //   const observer = new MutationObserver((mutations, observer) => {
  //     mutations.forEach((mutaion) => {
  //       console.log(mutaion);
  //     })
  //   });
  //   observer.observe(nativeCanvas, { attributes: true, childList: true, subtree: true })
  // }

  private createWindowByConfig(params: IWindowParams) {
    // 创建canvas
    const nativeCanvas = this.global.createCanvas({
      width: params.width,
      height: params.height
    });
    // 保存到dom中
    let container: HTMLElement | null;
    if (typeof params.container === 'string') {
      container = this.global.getElementById(params.container);
    } else if (params.container) {
      container = params.container;
    } else {
      container = this.global.getRootElement();
    }
    if (!container) {
      throw new Error('发生错误，containerId可能传入有误');
    }

    if (!params.offscreen) {
      container.appendChild(nativeCanvas);
    } else {
      container = null;
    }

    // 绑定
    const options = {
      width: params.width,
      height: params.height,
      dpr: params.dpr,
      nativeCanvas,
      container,
      id: Generator.GenAutoIncrementId().toString(),
      canvasControled: true
    };
    this.canvas = new BrowserCanvas(options);
    // 应用位置属性
    // window上的不需要设置position
    // this.canvas.applyPosition();
    // this.canvas.resetStyle(options);
  }
  private createWindowByCanvas(params: IWindowParams) {
    // 获取canvas
    let canvas: HTMLCanvasElement | null;
    if (typeof params.canvas === 'string') {
      canvas = this.global.getElementById(params.canvas) as HTMLCanvasElement | null;
      if (!canvas) {
        throw new Error('canvasId 参数不正确，请确认canvas存在并插入dom');
      }
    } else {
      canvas = params!.canvas as HTMLCanvasElement | null;
    }
    if (!canvas) {
      throw new Error('发生错误，传入的canvas不正确');
    }

    // 如果没有传入wh，或者是不受控制的canvas，那就用canvas的原始wh
    let width = params.width;
    let height = params.height;
    if (width == null || height == null || !params.canvasControled) {
      const data = canvas.getBoundingClientRect();
      width = data.width;
      height = data.height;
    }
    // 如果没有dpr，就使用canvas的原始dpr
    let dpr = params.dpr;
    if (params.canvasControled === false) {
      if (dpr) {
        console.warn('canvasControled为false后，dpr参数将无效');
      }
      dpr = null;
    }
    if (dpr == null) {
      const ctx = canvas.getContext('2d');
      // 兼容XTable
      dpr = (ctx as any).pixelRatio ?? canvas.width / width;
    }
    this.canvas = new BrowserCanvas({
      width: width,
      height: height,
      dpr: dpr,
      nativeCanvas: canvas,
      canvasControled: params.canvasControled
    });
    // if (params.canvasControled) {
    //   this.canvas.resetStyle({
    //     width,
    //     height,
    //     dpr
    //   });
    // }
  }
  releaseWindow(): void {
    this.canvas.release();
  }
  resizeWindow(width: number, height: number): void {
    this.canvas.resize(width, height);
  }
  setDpr(dpr: number): void {
    this.canvas.dpr = dpr;
  }

  getContext(): IContext2d {
    return this.canvas.getContext();
  }
  getNativeHandler(): ICanvas {
    return this.canvas;
  }
  getDpr(): number {
    return this.canvas.dpr;
  }

  addEventListener<K extends keyof DocumentEventMap>(
    type: K,
    listener: (this: Document, ev: DocumentEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void {
    return (this.canvas.nativeCanvas as HTMLCanvasElement).addEventListener(type, listener, options);
  }
  removeEventListener<K extends keyof DocumentEventMap>(
    type: K,
    listener: (this: Document, ev: DocumentEventMap[K]) => any,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void {
    return (this.canvas.nativeCanvas as HTMLCanvasElement).removeEventListener(type, listener, options);
  }
  dispatchEvent(event: any): boolean {
    return (this.canvas.nativeCanvas as HTMLCanvasElement).dispatchEvent(event);
  }

  getStyle(): CSSStyleDeclaration | Record<string, any> {
    return this.canvas.nativeCanvas.style;
  }
  setStyle(style: CSSStyleDeclaration | Record<string, any>) {
    this.canvas.nativeCanvas.style = style;
  }

  getBoundingClientRect(): IDomRectLike {
    const c = this.canvas.nativeCanvas as HTMLCanvasElement;
    const wh = this.getWH();
    if (!c.parentElement) {
      return {
        x: 0,
        y: 0,
        width: wh.width,
        height: wh.height,
        left: 0,
        top: 0,
        right: 0,
        bottom: 0
      };
    }
    return this.canvas.nativeCanvas.getBoundingClientRect();
  }

  clearViewBox(vb: IBoundsLike, color?: string): void {
    const context = this.getContext();
    const dpr = this.getDpr();
    context.nativeContext.save();
    (context.nativeContext as CanvasRenderingContext2D).setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(vb.x1, vb.y1, vb.x2 - vb.x1, vb.y2 - vb.y1);
    if (color) {
      context.fillStyle = color;
      context.fillRect(vb.x1, vb.y1, vb.x2 - vb.x1, vb.y2 - vb.y1);
    }
    context.nativeContext.restore();
  }

  isVisible(bbox?: IBoundsLike) {
    return this._canvasIsIntersecting;
  }

  onVisibleChange(cb: (currentVisible: boolean) => void) {
    this._onVisibleChangeCb = cb;
  }

  getTopLeft(baseWindow?: boolean): { top: number; left: number } {
    return this.global.getElementTopLeft(this.canvas.nativeCanvas, baseWindow);
  }
}

export const browserWindowModule = new ContainerModule(bind => {
  // browser
  bind(BrowserWindowHandlerContribution).toSelf();
  bind(WindowHandlerContribution)
    .toDynamicValue(ctx => ctx.container.get(BrowserWindowHandlerContribution))
    .whenTargetNamed(BrowserWindowHandlerContribution.env);
});
