import { injectable, BaseCanvas } from '@visactor/vrender-core';
import type { ICanvas, CanvasConfigType, EnvType } from '@visactor/vrender-core';
import { TTContext2d } from './context';

@injectable()
export class TTCanvas extends BaseCanvas implements ICanvas {
  static env: EnvType = 'tt';

  /**
   * 通过canvas生成一个wrap对象，初始化时不会再设置canvas的属性
   * @param params
   */
  constructor(params: CanvasConfigType) {
    super(params);
  }

  init() {
    this._context = new TTContext2d(this, this._dpr);
  }

  release(...params: any): void {
    return;
  }
}
