import { injectable } from 'inversify';
import type { Canvas } from 'canvas';
import type { EnvType, CanvasConfigType, ICanvas, IContext2d } from '@visactor/vrender';
import { NodeContext2d } from './context';

const DefaultConfig = {
  WIDTH: 500,
  HEIGHT: 500,
  DPR: 1
};

@injectable()
export class NodeCanvas implements ICanvas {
  static env: EnvType = 'node';
  // 显示的宽高，如果是离屏canvas，就是pixelWidth / pixelRatio
  private _width: number; // 显示的宽度
  private _height: number; // 显示的高度
  private _id: number | string;

  private _nativeCanvas: Canvas;
  private _context: IContext2d;
  private _visiable: boolean;
  private controled: boolean;

  get id(): number | string {
    return this._id;
  }
  get x(): number {
    return 0;
  }
  get y(): number {
    return 0;
  }
  get nativeCanvas(): Canvas {
    return this._nativeCanvas;
  }

  get width(): number {
    return this._width;
  }
  set width(width: number) {
    this._width = width;
  }
  get displayWidth(): number {
    return this._width;
  }
  get displayHeight(): number {
    return this._height;
  }

  get height(): number {
    return this._height;
  }
  set height(height: number) {
    this._height = height;
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
    return 1;
  }
  set dpr(dpr: number) {
    return;
  }

  /**
   * 通过canvas生成一个wrap对象，初始化时不会再设置canvas的属性
   * @param params
   */
  constructor(params: CanvasConfigType) {
    const { nativeCanvas, width = DefaultConfig.WIDTH, height = DefaultConfig.HEIGHT, canvasControled = true } = params;
    this._visiable = params.visiable !== false;
    this.controled = canvasControled;

    // 离屏canvas
    this._width = width;
    this._height = height;
    this._nativeCanvas = nativeCanvas as unknown as Canvas;
    this._context = new NodeContext2d(this, params.dpr);
    this._id = nativeCanvas.id;
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
    if (this._nativeCanvas) {
      this._nativeCanvas.width = width;
      this._nativeCanvas.height = height;
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
    throw new Error('暂不支持release');
  }
}
