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
  EnvType,
  IGlobal,
  IContext2d,
  ICanvas,
  IDomRectLike,
  IWindowParams,
  IWindowHandlerContribution
} from '@visactor/vrender-core';
import { HarmonyCanvas } from '../../canvas/contributions/harmony';

class MiniAppEventManager {
  addEventListener(type: string, func: EventListenerOrEventListenerObject) {
    if (!type || !func) {
      return;
    }
    this.cache[type] = this.cache[type] || {
      listener: []
    };
    this.cache[type].listener.push(func);
  }
  removeEventListener(type: string, func: EventListenerOrEventListenerObject) {
    if (!type || !func) {
      return;
    }
    if (!this.cache[type]) {
      return;
    }
    const index = this.cache[type].listener.findIndex((f: EventListenerOrEventListenerObject) => f === func);
    if (index >= 0) {
      this.cache[type].listener.splice(index, 1);
    }
  }
  cleanEvent() {
    this.cache = {};
  }
  cache: Record<string, { listener: EventListenerOrEventListenerObject[] }> = {};
}

@injectable()
export class HarmonyWindowHandlerContribution
  extends BaseWindowHandlerContribution
  implements IWindowHandlerContribution
{
  static env: EnvType = 'harmony';
  type: EnvType = 'harmony';

  protected eventManager = new MiniAppEventManager();

  canvas: ICanvas;
  get container(): HTMLElement | null {
    return null;
  }

  constructor(@inject(VGlobal) private readonly global: IGlobal) {
    super();
  }

  getTitle(): string {
    return this.canvas.id && this.canvas.id.toString();
  }

  getWH(): { width: number; height: number } {
    return {
      width: this.canvas.width / (this.canvas.dpr || 1),
      height: this.canvas.height / (this.canvas.dpr || 1)
    };
  }

  getXY(): { x: number; y: number } {
    return { x: 0, y: 0 };
  }

  createWindow(params: IWindowParams): void {
    // 如果没有传入canvas，那么就创建一个canvas
    if (!params.canvas) {
      this.createWindowByConfig(params);
    } else {
      this.createWindowByCanvas(params);
    }
  }
  private createWindowByConfig(params: IWindowParams) {
    // 创建canvas
    const nativeCanvas = this.global.createCanvas({
      width: params.width,
      height: params.height
    });

    // 绑定
    const options = {
      width: params.width,
      height: params.height,
      dpr: params.dpr,
      nativeCanvas,
      id: Generator.GenAutoIncrementId().toString(),
      canvasControled: false
    };
    this.canvas = new HarmonyCanvas(options);
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

    // 如果没有传入wh，或者是不受控制的canvas，那就用canvas的原始wh
    let width = params.width;
    let height = params.height;
    if (width == null || height == null || !params.canvasControled) {
      const data = canvas.getBoundingClientRect();
      width = data.width;
      height = data.height;
    }
    this.canvas = new HarmonyCanvas({
      width: width,
      height: height,
      dpr: 1,
      nativeCanvas: canvas,
      canvasControled: params.canvasControled
    });
  }
  releaseWindow(): void {
    return;
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
  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void {
    this.eventManager.addEventListener(type, listener);
  }
  removeEventListener<K extends keyof DocumentEventMap>(
    type: K,
    listener: (this: Document, ev: DocumentEventMap[K]) => any,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void {
    this.eventManager.removeEventListener(type, listener);
  }
  dispatchEvent(event: any): boolean {
    const { type } = event;
    if (!this.eventManager.cache[type]) {
      return false;
    }

    // hack for offsetX offsetY
    if (event.changedTouches && event.changedTouches[0]) {
      event.offsetX = event.changedTouches[0].x;
      event.changedTouches[0].offsetX = event.changedTouches[0].x;
      event.changedTouches[0].clientX = event.changedTouches[0].x;
      event.offsetY = event.changedTouches[0].y;
      event.changedTouches[0].offsetY = event.changedTouches[0].y;
      event.changedTouches[0].clientY = event.changedTouches[0].y;
    }
    event.preventDefault = () => {
      return;
    };
    event.stopPropagation = () => {
      return;
    };
    if (this.eventManager.cache[type].listener) {
      this.eventManager.cache[type].listener.forEach((f: EventListener) => {
        f(event);
      });
    }
    return true;
  }

  getStyle(): CSSStyleDeclaration | Record<string, any> {
    return {};
  }
  setStyle(style: CSSStyleDeclaration | Record<string, any>) {
    return;
  }

  getBoundingClientRect(): IDomRectLike {
    const wh = this.getWH();
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

  clearViewBox(color?: string): void {
    const vb = this.viewBox;
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
}

export const harmonyWindowModule = new ContainerModule(bind => {
  // harmony
  bind(HarmonyWindowHandlerContribution).toSelf();
  bind(WindowHandlerContribution)
    .toDynamicValue(ctx => ctx.container.get(HarmonyWindowHandlerContribution))
    .whenTargetNamed(HarmonyWindowHandlerContribution.env);
});
