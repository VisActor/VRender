import type { CanvasConfigType, ICanvas, IContext2d, EnvType } from '../../interface';

const DefaultConfig = {
  WIDTH: 500,
  HEIGHT: 500,
  DPR: 1
};

export abstract class BaseCanvas implements ICanvas {
  static env: EnvType = 'browser';
  // 显示的宽高，如果是离屏canvas，就是pixelWidth / pixelRatio
  protected _displayWidth: number; // 显示的宽度
  protected _displayHeight: number; // 显示的高度
  protected _id: number | string;
  // 像素宽高
  protected _pixelWidth: number; // 像素宽度
  protected _pixelHeight: number; // 像素高度

  protected _x: number;
  protected _y: number;
  protected _dpr: number;

  protected _container?: HTMLElement | null;
  protected _nativeCanvas: HTMLCanvasElement;
  protected _context: IContext2d;
  protected _visiable: boolean;
  protected controled: boolean;

  get displayWidth(): number {
    return this._pixelWidth / this._dpr;
  }

  get displayHeight(): number {
    return this._pixelHeight / this._dpr;
  }
  /**
   * TODO
   *  get\set 方法看看是否可以删掉
   */
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
      x,
      y,
      id,
      canvasControled = true
    } = params;
    const offsetX = 0;
    const offsetY = 0;
    this._x = x ?? offsetX;
    this._y = y ?? offsetY;
    this._pixelWidth = width * dpr;
    this._pixelHeight = height * dpr;
    this._visiable = params.visiable !== false;
    this.controled = canvasControled;

    // 离屏canvas
    this._displayWidth = width;
    this._displayHeight = height;
    this._dpr = dpr;
    this._nativeCanvas = nativeCanvas;
    this._id = nativeCanvas.id ?? id;
    if (id) {
      nativeCanvas.id = id;
    }

    this.init(params);
  }

  getNativeCanvas(): HTMLCanvasElement {
    return this._nativeCanvas;
  }
  hide() {
    return;
  }
  show() {
    return;
  }

  abstract init(params: CanvasConfigType): void;

  applyPosition(): void {
    return;
  }

  resetStyle(params: Partial<CanvasConfigType>): void {
    return;
  }

  /**
   * 设置canvas的size大小，设置context的scale
   * @param width
   * @param height
   */
  resize(width: number, height: number): void {
    return;
  }

  toDataURL(): string;
  toDataURL(mimeType: 'image/png'): string;
  toDataURL(mimeType: 'image/jpeg', quality: number): string;
  toDataURL(mimeType?: string, quality?: number) {
    return '';
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
