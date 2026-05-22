import {
  Generator,
  BaseWindowHandlerContribution,
  WindowHandlerContribution,
  application,
  type EnvType,
  type IGlobal,
  type IContext2d,
  type ICanvas,
  type IDomRectLike,
  type IWindowParams,
  type IWindowHandlerContribution
} from '@visactor/vrender-core';
import { LynxCanvas } from '../../canvas/contributions/lynx';

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

function setMiniAppEventTarget(event: any, key: 'target' | 'currentTarget', value: any) {
  if (!event || !value) {
    return;
  }

  try {
    event[key] = value;
  } catch {
    Object.defineProperty(event, key, {
      configurable: true,
      value
    });
  }
}

function isValidCoordinate(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function pickCoordinate(...values: unknown[]): number | undefined {
  for (let i = 0; i < values.length; i++) {
    if (isValidCoordinate(values[i])) {
      return values[i] as number;
    }
  }
  return undefined;
}

function setLynxEventValue(
  event: any,
  key: 'x' | 'y' | 'offsetX' | 'offsetY' | 'clientX' | 'clientY' | 'pageX' | 'pageY' | 'touches',
  value: any
) {
  try {
    event[key] = value;
  } catch {
    Object.defineProperty(event, key, {
      configurable: true,
      value
    });
  }
}

function normalizeLynxTouchEventPoint(event: any) {
  const touch = event?.changedTouches?.[0] ?? event?.touches?.[0];
  if (!touch) {
    return;
  }

  const x = pickCoordinate(
    event.x,
    event.offsetX,
    event.clientX,
    event.pageX,
    touch.x,
    touch.offsetX,
    touch.clientX,
    touch.pageX
  );
  const y = pickCoordinate(
    event.y,
    event.offsetY,
    event.clientY,
    event.pageY,
    touch.y,
    touch.offsetY,
    touch.clientY,
    touch.pageY
  );
  if (x == null || y == null) {
    return;
  }

  if (!event.touches && event.changedTouches) {
    setLynxEventValue(
      event,
      'touches',
      event.type === 'touchend' || event.type === 'touchcancel' ? [] : event.changedTouches
    );
  }

  setLynxEventValue(event, 'x', x);
  setLynxEventValue(event, 'y', y);
  setLynxEventValue(event, 'offsetX', event.offsetX ?? x);
  setLynxEventValue(event, 'offsetY', event.offsetY ?? y);
  setLynxEventValue(event, 'clientX', event.clientX ?? x);
  setLynxEventValue(event, 'clientY', event.clientY ?? y);
  setLynxEventValue(event, 'pageX', event.pageX ?? x);
  setLynxEventValue(event, 'pageY', event.pageY ?? y);

  touch.x = touch.x ?? x;
  touch.y = touch.y ?? y;
  touch.offsetX = touch.offsetX ?? x;
  touch.offsetY = touch.offsetY ?? y;
  touch.clientX = touch.clientX ?? x;
  touch.clientY = touch.clientY ?? y;
  touch.pageX = touch.pageX ?? x;
  touch.pageY = touch.pageY ?? y;
}

export class LynxWindowHandlerContribution extends BaseWindowHandlerContribution implements IWindowHandlerContribution {
  static env: EnvType = 'lynx';
  type: EnvType = 'lynx';

  protected eventManager = new MiniAppEventManager();

  canvas: ICanvas;
  get container(): HTMLElement | null {
    return null;
  }

  constructor(private readonly global: IGlobal = application.global) {
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
    this.canvas = new LynxCanvas(options);
  }
  private createWindowByCanvas(params: IWindowParams) {
    // 获取canvas
    let canvas: HTMLCanvasElement | null;
    if (typeof params.canvas === 'string') {
      canvas = this.global.getElementById(params.canvas) as HTMLCanvasElement | null;
      if (!canvas) {
        canvas = this.global.createCanvas({
          id: params.canvas,
          width: params.width,
          height: params.height,
          dpr: params.dpr
        }) as HTMLCanvasElement | null;
      }
      if (!canvas) {
        throw new Error('canvasId 参数不正确，请确认canvas存在并插入dom');
      }
    } else {
      canvas = params.canvas as HTMLCanvasElement | null;
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
    if (dpr == null) {
      dpr = canvas.width / width;
    }
    this.canvas = new LynxCanvas({
      width: width,
      height: height,
      dpr: dpr,
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

    const nativeCanvas = this.canvas?.nativeCanvas;
    setMiniAppEventTarget(event, 'target', nativeCanvas);
    setMiniAppEventTarget(event, 'currentTarget', nativeCanvas);

    normalizeLynxTouchEventPoint(event);
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

export function bindLynxWindowContribution(container: any) {
  if (!container.isBound?.(LynxWindowHandlerContribution)) {
    container.bind(LynxWindowHandlerContribution).toSelf();
  }
  if (!container.getNamed?.(WindowHandlerContribution, LynxWindowHandlerContribution.env)) {
    container
      .bind(WindowHandlerContribution)
      .toService(LynxWindowHandlerContribution)
      .whenTargetNamed(LynxWindowHandlerContribution.env);
  }
}
