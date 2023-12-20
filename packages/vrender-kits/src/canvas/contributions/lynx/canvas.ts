import { injectable, BaseCanvas } from '@visactor/vrender-core';
import type { ICanvas, CanvasConfigType, EnvType } from '@visactor/vrender-core';
import { LynxContext2d } from './context';

@injectable()
export class LynxCanvas extends BaseCanvas implements ICanvas {
  static env: EnvType = 'lynx';

  /**
   * 通过canvas生成一个wrap对象，初始化时不会再设置canvas的属性
   * @param params
   */
  constructor(params: CanvasConfigType) {
    super(params);
  }

  init() {
    this._context = new LynxContext2d(this, this._dpr);
  }

  resize(width: number, height: number): void {
    // 设置Canvas的w和h
    this._pixelWidth = width * this._dpr;
    this._pixelHeight = height * this._dpr;
    this._displayWidth = width;
    this._displayHeight = height;

    this._nativeCanvas.width = this._pixelWidth;
    this._nativeCanvas.height = this._pixelHeight;
    if ((this._nativeCanvas as any).nativeCanvas) {
      (this._nativeCanvas as any).nativeCanvas.width = this._pixelWidth;
      (this._nativeCanvas as any).nativeCanvas.height = this._pixelHeight;
    }

    // 设置context的dpr
    const _context = this._context;
    _context.dpr = this._dpr;
  }

  release(...params: any): void {
    return;
  }
}
