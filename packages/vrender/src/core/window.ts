import { inject, injectable, postConstruct } from 'inversify';
import type { IBoundsLike } from '@visactor/vutils';
import { Generator } from '../common/generator';
import type {
  ICanvas,
  IContext2d,
  IDomRectLike,
  IGlobal,
  IWindow,
  IWindowHandlerContribution,
  IWindowParams
} from '../interface';
import { container } from '../container';
import { SyncHook } from '../tapable';
import { VGlobal } from '../constants';

export const VWindow = Symbol.for('VWindow');

export const WindowHandlerContribution = Symbol.for('WindowHandlerContribution');

/**
 * 窗口
 * 对于浏览器，就是管理某个Stage影响的Canvas
 * 对于原生，就是管理这个系统窗口
 */
@injectable()
export class DefaultWindow implements IWindow {
  protected _width: number;
  protected _height: number;
  protected _handler: IWindowHandlerContribution;

  hooks = {
    onChange: new SyncHook<[number, number, number, number]>(['x', 'y', 'width', 'height'])
  };

  // 父窗口(容器)，对于浏览器来说就是container dom
  declare parent: Window;
  // 窗口的大小
  get width(): number {
    if (this._handler) {
      const wh = this._handler.getWH();
      return (this._width = wh.width);
    }
    return this._width;
  }
  get height(): number {
    if (this._handler) {
      const wh = this._handler.getWH();
      return (this._height = wh.height);
    }
    return this._height;
  }
  // 窗口的位置
  // declare x: number;
  // declare y: number;
  declare _uid: number;
  // 窗口操作配置
  declare resizable: boolean;
  declare minHeight: number;
  declare minWidth: number;
  declare maxHeight: number;
  declare maxWidth: number;
  // 窗口配置
  declare title: string;

  /* 浏览器环境配置 */
  // 这是主体canvas，对于单图层来说就是绘图canvas
  // 对于多图层画布来说，就是用户传入的或者默认的一个canvas
  declare mainCanvas: ICanvas;
  declare layerCanvas: ICanvas[];
  declare actived: boolean;
  get dpr(): number {
    return this._handler.getDpr();
  }

  constructor(
    @inject(VGlobal) public readonly global: IGlobal // @inject(ContributionProvider) // @named(WindowHandlerContribution) // protected readonly contributions: ContributionProvider<IWindowHandlerContribution>
  ) {
    this._uid = Generator.GenAutoIncrementId();
  }

  @postConstruct()
  protected postInit() {
    this.global.hooks.onSetEnv.tap('window', () => {
      this.active();
    });
    this.active();
  }

  protected active() {
    const global = this.global;
    if (!global.env || this.actived) {
      return;
    }
    const handler = container.getNamed<IWindowHandlerContribution>(WindowHandlerContribution, global.env);
    handler.configure(this, global);
    // this.contributions.getContributions().forEach((handlerContribution) => {
    //   handlerContribution.configure(this, this.global);
    // });
    this.actived = true;
  }

  get style(): CSSStyleDeclaration | Record<string, any> {
    return this._handler.getStyle();
  }

  set style(style: CSSStyleDeclaration | Record<string, any>) {
    this._handler.setStyle(style);
  }

  create(params: IWindowParams): void {
    // 通过handler创建窗口
    this._handler.createWindow(params);

    // 使用window的wh
    const windowWH = this._handler.getWH();
    this._width = windowWH.width;
    this._height = windowWH.height;
    // 使用window的xy
    // const windowXY = this._handler.getXY();
    // this.x = windowXY.x;
    // this.y = windowXY.y;
    // 使用window的title
    this.title = this._handler.getTitle();
    this.resizable = true;
  }

  setWindowHandler(handler: IWindowHandlerContribution) {
    this._handler = handler;
  }

  setDpr(dpr: number): void {
    return this._handler.setDpr(dpr);
  }
  resize(w: number, h: number): void {
    return this._handler.resizeWindow(w, h);
  }
  configure(): void {
    throw new Error('暂不支持');
  }
  release(): void {
    return this._handler.releaseWindow();
  }
  getContext(): IContext2d {
    return this._handler.getContext();
  }
  getNativeHandler(): ICanvas {
    return this._handler.getNativeHandler();
  }
  getImageBuffer(type?: string): any {
    if (!this._handler.getImageBuffer) {
      return null;
    }
    return this._handler.getImageBuffer(type);
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
    return this._handler.addEventListener(type, listener, options);
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
    return this._handler.removeEventListener(type, listener, options);
  }

  dispatchEvent(event: any): boolean {
    return this._handler.dispatchEvent(event);
  }

  getBoundingClientRect(): IDomRectLike {
    return this._handler.getBoundingClientRect();
  }

  getContainer(): HTMLElement | any {
    return this._handler.container;
  }

  clearViewBox(viewBox: IBoundsLike, color?: string) {
    this._handler.clearViewBox(viewBox, color);
  }
}
