// 参考konva
import { injectable } from '@visactor/vrender-core';
import type { IContext2d, EnvType } from '@visactor/vrender-core';
import { BrowserContext2d } from '../browser';

@injectable()
export class WxContext2d extends BrowserContext2d implements IContext2d {
  static env: EnvType = 'wx';

  draw() {
    return;
  }

  createPattern(image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement, repetition: string): CanvasPattern {
    return null;
  }
}
