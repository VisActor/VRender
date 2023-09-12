import { injectable } from '../../../common/inversify-lite';
import type { ICanvas, IContext2d, CanvasConfigType, EnvType } from '../../../interface';
import { LynxContext2d } from './context';

const DefaultConfig = {
  WIDTH: 500,
  HEIGHT: 500,
  DPR: 1
};

@injectable()
export class LynxCanvas implements ICanvas {
  static env: EnvType = 'lynx';
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
  get displayWidth(): number {
    return this._displayWidth;
  }
  get displayHeight(): number {
    return this._displayHeight;
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
      dpr = DefaultConfig.DPR
    } = params;
    // 不会修改到位置的
    const { x, y } = nativeCanvas.getBoundingClientRect ? nativeCanvas.getBoundingClientRect() : { x: 0, y: 0 };
    this._x = x;
    this._y = y;
    this._pixelWidth = width * dpr;
    this._pixelHeight = height * dpr;
    this._visiable = params.visiable !== false;

    // 离屏canvas
    this._displayWidth = width;
    this._displayHeight = height;
    this._dpr = dpr;
    this._nativeCanvas = nativeCanvas;
    this._context = new LynxContext2d(this, this._dpr);
    this._id = nativeCanvas.id;
  }

  getNativeCanvas(): HTMLCanvasElement {
    return this._nativeCanvas;
  }

  resetStyle(params: Partial<CanvasConfigType>) {
    return;
  }

  applyPosition() {
    return;
  }

  hide() {
    return;
  }
  show() {
    return;
  }

  /**
   * 设置canvas的size大小，设置context的scale
   * @param width
   * @param height
   */
  resize(width: number, height: number) {
    return;
  }

  toDataURL(): string;
  toDataURL(mimeType: 'image/png'): string;
  toDataURL(mimeType: 'image/jpeg', quality: number): string;
  toDataURL(mimeType?: string, quality?: number) {
    return '';
  }

  readPixels(x: number, y: number, w: number, h: number): ImageData | Promise<ImageData> {
    throw new Error('暂未实现');
  }

  convertToBlob(options?: { type?: string | undefined; quality?: number | undefined } | undefined): Promise<Blob> {
    throw new Error('暂未实现');
  }

  transferToImageBitmap(): ImageBitmap {
    throw new Error('暂未实现');
  }

  release(...params: any): void {
    return;
  }
}
