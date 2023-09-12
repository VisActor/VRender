import { injectable } from '../../../common/inversify-lite';
import type { EnvType, CanvasConfigType, ICanvas, IContext2d } from '../../../interface';
import { NodeContext2d } from './context';
import { isFunction } from '@visactor/vutils';

type Canvas = any;

const DefaultConfig = {
  WIDTH: 500,
  HEIGHT: 500,
  DPR: 1
};

@injectable()
export class NodeCanvas implements ICanvas {
  static env: EnvType = 'node';
  // 显示的宽高，如果是离屏canvas，就是pixelWidth / pixelRatio
  private _id: number | string;

  private _displayWidth: number; // 显示的宽度
  private _displayHeight: number; // 显示的高度
  // 像素宽高
  private _pixelWidth: number; // 像素宽度
  private _pixelHeight: number; // 像素高度

  private _nativeCanvas: Canvas;
  private _context: IContext2d;
  private _visiable: boolean;
  private controled: boolean;
  private _dpr: number;

  get id(): number | string {
    return this._id;
  }
  get x(): number {
    return 0;
  }
  set x(_x: number) {
    // this._x = _x;
    return;
  }
  get y(): number {
    return 0;
  }
  set y(_y: number) {
    // this._y = _y;
    return;
  }
  get nativeCanvas(): Canvas {
    return this._nativeCanvas;
  }

  get width(): number {
    return this._pixelWidth;
  }
  set width(width: number) {
    this._pixelWidth = width;
    this._displayWidth = width / (this._dpr || 1);
  }
  get displayWidth(): number {
    return this._pixelWidth / this._dpr;
  }

  get displayHeight(): number {
    return this._pixelHeight / this._dpr;
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
    this._dpr = dpr;
    this.resize(this.width, this.height);
    return;
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
      canvasControled = true,
      dpr = DefaultConfig.DPR
    } = params;
    this._visiable = params.visiable !== false;
    this.controled = canvasControled;

    // 离屏canvas
    this._pixelWidth = width * dpr;
    this._pixelHeight = height * dpr;
    this._displayWidth = width;
    this._displayHeight = height;
    this._nativeCanvas = nativeCanvas as unknown as Canvas;
    this._context = new NodeContext2d(this, params.dpr);
    this._id = nativeCanvas.id;
    this._dpr = dpr;
  }

  applyPosition() {
    return;
  }

  getNativeCanvas(): Canvas {
    return this._nativeCanvas;
  }

  resetStyle(params: Partial<CanvasConfigType>) {
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
    this._pixelWidth = width * this._dpr;
    this._pixelHeight = height * this._dpr;
    this._displayWidth = width;
    this._displayHeight = height;
    if (this._nativeCanvas) {
      this._nativeCanvas.width = this._pixelWidth;
      this._nativeCanvas.height = this._pixelHeight;
    }
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
    if ((this._nativeCanvas as any).release && isFunction((this._nativeCanvas as any).release)) {
      (this._nativeCanvas as any).release();
    }
  }
}
