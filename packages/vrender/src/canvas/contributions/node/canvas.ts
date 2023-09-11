import { injectable } from 'inversify';
import type { ICanvas, CanvasConfigType, EnvType } from '../../../interface';
import { BaseCanvas } from '../base-canvas';
import { NodeContext2d } from './context';
import { isFunction } from '@visactor/vutils';

@injectable()
export class NodeCanvas extends BaseCanvas implements ICanvas {
  static env: EnvType = 'node';

  /**
   * 通过canvas生成一个wrap对象，初始化时不会再设置canvas的属性
   * @param params
   */
  constructor(params: CanvasConfigType) {
    super(params);
  }

  init() {
    this._context = new NodeContext2d(this, this._dpr);
  }

  release(...params: any): void {
    if ((this._nativeCanvas as any).release && isFunction((this._nativeCanvas as any).release)) {
      (this._nativeCanvas as any).release();
    }
  }
}
