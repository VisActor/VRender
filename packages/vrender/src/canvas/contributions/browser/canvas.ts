import { injectable } from '../../../common/inversify-lite';
import { application } from '../../../application';
import type { CanvasConfigType, ICanvas, IContext2d, EnvType } from '../../../interface';
import { BrowserContext2d } from './context';

const DefaultConfig = {
  WIDTH: 500,
  HEIGHT: 500,
  DPR: 1
};

@injectable()
export class BrowserCanvas implements ICanvas {
  static env: EnvType = 'browser';
  // 显示的宽高，如果是离屏canvas，就是pixelWidth / pixelRatio
  private _displayWidth: number; // 显示的宽度
  private _displayHeight: number; // 显示的高度
  private _id: number | string;
  // 像素宽高
  private _pixelWidth: number; // 像素宽度
  private _pixelHeight: number; // 像素高度

  private _x: number;
  private _y: number;
  private _dpr: number;

  private _container?: HTMLElement | null;
  private _nativeCanvas: HTMLCanvasElement;
  private _context: IContext2d;
  private _visiable: boolean;
  private controled: boolean;

  get displayWidth(): number {
    return this._pixelWidth / this._dpr;
  }

  get displayHeight(): number {
    return this._pixelHeight / this._dpr;
  }

  get id(): number | string {
    return this._id;
  }
  get x(): number {
    return this._x;
  }
  set x(_x: number) {
    this._x = _x;
  }
  get y(): number {
    return this._y;
  }
  set y(_y: number) {
    this._y = _y;
  }
  get nativeCanvas(): HTMLCanvasElement {
    return this._nativeCanvas;
  }

  get width(): number {
    return this._pixelWidth;
  }
  set width(width: number) {
    this._pixelWidth = width;
    this._displayWidth = width / (this._dpr || 1);
  }

  get height(): number {
    return this._pixelHeight;
  }
  set height(height: number) {
    this._pixelHeight = height;
    this._displayHeight = height / (this._dpr || 1);
  }
  getContext(str?: string): IContext2d {
    return this._context;
  }

  get visiable(): boolean {
    return this._visiable;
  }
  set visiable(visiable: boolean) {
    this._visiable = visiable;
    visiable ? this.show() : this.hide();
  }

  get dpr(): number {
    return this._dpr;
  }
  set dpr(dpr: number) {
    // this._lastPixelRatio = this._pixelRatio;
    this._dpr = dpr;
    this.resize(this._displayWidth, this._displayHeight);
  }

  /**
   * 通过canvas生成一个wrap对象，初始化时不会再设置canvas的属性
   * @param params
   */
  constructor(params: CanvasConfigType) {
    const {
      nativeCanvas,
      width = DefaultConfig.WIDTH,
      height = DefaultConfig.HEIGHT,
      dpr = DefaultConfig.DPR,
      container,
      x,
      y,
      canvasControled = true
    } = params;
    // const data = nativeCanvas.getBoundingClientRect ? nativeCanvas.getBoundingClientRect() : { x: 0, y: 0 };
    // const offsetX = nativeCanvas.offsetLeft ?? 0;
    // const offsetY = nativeCanvas.offsetTop ?? 0;
    const offsetX = 0;
    const offsetY = 0;
    this._x = x ?? offsetX;
    this._y = y ?? offsetY;
    this._pixelWidth = width * dpr;
    this._pixelHeight = height * dpr;
    this._visiable = params.visiable !== false;
    this.controled = canvasControled;
    if (typeof container === 'string') {
      const _c = application.global.getElementById(container);
      if (_c) {
        this._container = _c;
      }
    } else {
      this._container = container;
    }

    // 离屏canvas
    this._displayWidth = width;
    this._displayHeight = height;
    this._dpr = dpr;
    this._nativeCanvas = nativeCanvas;
    this._context = new BrowserContext2d(this, this._dpr);
    this._id = nativeCanvas.id;

    this.initStyle();
  }

  initStyle() {
    if (!this.controled) {
      return;
    }
    const { nativeCanvas } = this;
    nativeCanvas.width = this._pixelWidth;
    nativeCanvas.height = this._pixelHeight;

    const isOffscreen = !nativeCanvas.style;
    if (!isOffscreen) {
      this.setCanvasStyle(nativeCanvas, this._x, this._y, this._displayWidth, this._displayHeight);
    }
    if (this.id != null) {
      nativeCanvas.id = this.id.toString();
    }
    if (this._container) {
      this._container.appendChild(nativeCanvas);
    }
    if (!this.visiable) {
      this.hide();
    }
    // this._context.setScale(this.dpr, this.dpr, true);
  }

  applyPosition() {
    const canvas = this._nativeCanvas;
    canvas.style.position = 'absolute';
    canvas.style.top = `${this._y}px`;
    canvas.style.left = `${this._x}px`;
  }

  getNativeCanvas(): HTMLCanvasElement {
    return this._nativeCanvas;
  }

  resetStyle(params: Partial<CanvasConfigType>) {
    if (!this.controled) {
      return;
    }
    const {
      width = this._displayWidth,
      height = this._displayHeight,
      dpr = this._dpr,
      x = this._x,
      y = this._y
    } = params;
    const { nativeCanvas } = this;
    nativeCanvas.width = width * dpr;
    nativeCanvas.height = height * dpr;

    const isOffscreen = !nativeCanvas.style;
    if (!isOffscreen) {
      this.setCanvasStyle(nativeCanvas, x, y, width, height);
    }
    params.id && (nativeCanvas.id = params.id);
    if (!this.visiable) {
      this.hide();
    }
    // this._context.setScale(dpr, dpr);
  }

  private setCanvasStyle(canvas: HTMLCanvasElement, x: number, y: number, w: number, h: number) {
    if (!this.controled) {
      return;
    }
    canvas.style.padding = '0';
    canvas.style.margin = '0';
    canvas.style.border = '0';
    canvas.style.background = 'transparent';
    // canvas.style.position = 'absolute';
    // canvas.style.top = `${y}px`;
    // canvas.style.left = `${x}px`;

    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
  }

  hide() {
    this._nativeCanvas && (this._nativeCanvas.style.display = 'none');
  }
  show() {
    this._nativeCanvas && (this._nativeCanvas.style.display = 'block');
  }

  /**
   * 设置canvas的size大小，设置context的scale
   * @param width
   * @param height
   */
  resize(width: number, height: number) {
    if (!this.controled) {
      return;
    }
    // 设置Canvas的w和h
    this._pixelWidth = width * this._dpr;
    this._pixelHeight = height * this._dpr;
    this._displayWidth = width;
    this._displayHeight = height;
    // 可能是离屏canvas
    if (this._nativeCanvas.style) {
      this._nativeCanvas.style.width = `${width}px`;
      this._nativeCanvas.style.height = `${height}px`;
    }
    this._nativeCanvas.width = this._pixelWidth;
    this._nativeCanvas.height = this._pixelHeight;

    // 设置context的dpr
    const _context = this._context;
    _context.dpr = this._dpr;
    // _context.setScale(this._dpr, this._dpr);
  }

  toDataURL(): string;
  toDataURL(mimeType: 'image/png'): string;
  toDataURL(mimeType: 'image/jpeg', quality: number): string;
  toDataURL(mimeType?: string, quality?: number) {
    if (mimeType === 'image/jpeg') {
      return this._nativeCanvas.toDataURL(mimeType, quality);
    } else if (mimeType === 'image/png') {
      return this._nativeCanvas.toDataURL(mimeType);
    }
    return this._nativeCanvas.toDataURL(mimeType, quality);
  }

  readPixels(x: number, y: number, w: number, h: number): ImageData | Promise<ImageData> {
    return this._context.getImageData(x, y, w, h);
  }

  convertToBlob(options?: { type?: string | undefined; quality?: number | undefined } | undefined): Promise<Blob> {
    throw new Error('暂未实现');
  }

  transferToImageBitmap(): ImageBitmap {
    throw new Error('暂未实现');
  }

  release(...params: any): void {
    if (this.controled) {
      this._nativeCanvas.parentElement && this._nativeCanvas.parentElement.removeChild(this._nativeCanvas);
    }
  }
}
