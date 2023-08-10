import { inject, injectable } from 'inversify';
import type {
  EnvType,
  IGlobal,
  IWindowHandlerContribution,
  IWindowParams,
  IContext2d,
  ICanvas,
  IDomRectLike
} from '@visactor/vrender';
import { Generator, Global, BaseWindowHandlerContribution } from '@visactor/vrender';
import type { IBoundsLike } from '@visactor/vutils';

@injectable()
export class NativeWindowHandlerContribution
  extends BaseWindowHandlerContribution
  implements IWindowHandlerContribution
{
  type: EnvType = 'native';

  protected width: number;
  protected height: number;
  protected dpr: number;

  get container(): HTMLElement | null {
    return null;
  }

  constructor(@inject(Global) private readonly global: IGlobal) {
    super();
  }

  getTitle(): string {
    return '';
  }

  getWH(): { width: number; height: number } {
    return {
      width: this.width,
      height: this.height
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
    return;
  }
  private createWindowByCanvas(params: IWindowParams) {
    return;
  }
  releaseWindow(): void {
    return;
  }
  resizeWindow(width: number, height: number): void {
    return;
  }
  setDpr(dpr: number): void {
    return;
  }

  getContext(): IContext2d {
    return null;
  }
  getNativeHandler(): ICanvas {
    return null;
  }
  getDpr(): number {
    return this.dpr;
  }

  getImageBuffer(type: string = 'image/png'): any {
    return;
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
  ): void;
  addEventListener(type: unknown, listener: unknown, options?: unknown): void {
    return;
  }

  dispatchEvent(event: any): boolean {
    return true;
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
  ): void;
  removeEventListener(type: unknown, listener: unknown, options?: unknown): void {
    return;
  }

  getStyle(): CSSStyleDeclaration | Record<string, any> {
    return;
  }
  setStyle(style: CSSStyleDeclaration | Record<string, any>): void {
    return;
  }

  getBoundingClientRect(): IDomRectLike {
    return null;
  }

  clearViewBox(vb: IBoundsLike, color?: string): void {
    return;
  }
}
