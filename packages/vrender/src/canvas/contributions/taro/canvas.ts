import { injectable } from 'inversify';
import type { ICanvas, CanvasConfigType, EnvType } from '../../../interface';
import { BaseCanvas } from '../base-canvas';
import { TaroContext2d } from './context';

@injectable()
export class TaroCanvas extends BaseCanvas implements ICanvas {
  static env: EnvType = 'taro';

  /**
   * 通过canvas生成一个wrap对象，初始化时不会再设置canvas的属性
   * @param params
   */
  constructor(params: CanvasConfigType) {
    super(params);
  }

  init() {
    this._context = new TaroContext2d(this, this._dpr);
  }

  release(...params: any): void {
    return;
  }
}
