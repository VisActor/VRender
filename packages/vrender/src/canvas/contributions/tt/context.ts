import { Matrix } from '@visactor/vutils';
import { injectable } from '../../../common/inversify-lite';
import type { IContext2d, IConicalGradientData, EnvType } from '../../../interface';
import { BrowserContext2d } from '../browser';

const initMatrix = new Matrix(1, 0, 0, 1, 0, 0);

@injectable()
export class TTContext2d extends BrowserContext2d implements IContext2d {
  static env: EnvType = 'tt';

  _globalAlpha: number;

  // feishu小程序无法正常获取到globalAlpha
  get globalAlpha(): number {
    return this._globalAlpha;
  }
  set globalAlpha(ga: number) {
    this.nativeContext.globalAlpha = ga;
    this._globalAlpha = ga;
  }

  createConicGradient(x: number, y: number, startAngle: number, endAngle: number): IConicalGradientData {
    return null;
  }

  createPattern(image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement, repetition: string): CanvasPattern {
    return null;
  }
}
