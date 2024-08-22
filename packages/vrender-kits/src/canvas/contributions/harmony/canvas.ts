import { injectable, BaseCanvas } from '@visactor/vrender-core';
import type { ICanvas, CanvasConfigType, EnvType } from '@visactor/vrender-core';
import { HarmonyContext2d } from './context';

@injectable()
export class HarmonyCanvas extends BaseCanvas implements ICanvas {
  static env: EnvType = 'harmony';

  /**
   * 通过canvas生成一个wrap对象，初始化时不会再设置canvas的属性
   * @param params
   */
  constructor(params: CanvasConfigType) {
    super(params);
  }

  init() {
    this._context = new HarmonyContext2d(this, this._dpr);
  }

  resize(width: number, height: number): void {
    return;
  }

  release(...params: any): void {
    return;
  }
}
