// 参考konva
import { injectable } from 'inversify';
import type { IContext2d, EnvType, ISetStrokeStyleParams, IStrokeStyleParams } from '../../../interface';
import { createColor, getScaledStroke } from '../../../common/canvas-utils';
import { BrowserContext2d } from '../browser';

@injectable()
export class LynxContext2d extends BrowserContext2d implements IContext2d {
  static env: EnvType = 'lynx';

  declare drawPromise?: Promise<any>;

  declare _globalAlpha: number;

  get globalAlpha(): number {
    return this._globalAlpha;
  }
  set globalAlpha(ga: number) {
    this.nativeContext.globalAlpha = ga;
    this._globalAlpha = ga;
  }

  setLineDash(segments: number[]) {
    const a = arguments;
    const _context = this.nativeContext;

    if (!!this.nativeContext.setLineDash) {
      const lineDash = a[0];
      // lynx环境中lineDash不能为[0, 0]
      if (lineDash[0] === 0 && lineDash[1] === 0) {
        return;
      }
      _context.setLineDash(lineDash);
    }
  }

  protected _setStrokeStyle(
    params: ISetStrokeStyleParams,
    attribute: IStrokeStyleParams,
    // 用于渐变色
    offsetX: number,
    offsetY: number,
    defaultParams?: IStrokeStyleParams
  ) {
    const _context = this.nativeContext;
    if (!defaultParams) {
      defaultParams = this.strokeAttributes;
    }
    const { strokeOpacity = defaultParams.strokeOpacity, opacity = defaultParams.opacity } = attribute;
    if (strokeOpacity > 1e-12 && opacity > 1e-12) {
      const {
        lineWidth = defaultParams.lineWidth,
        stroke = defaultParams.stroke,
        lineJoin = defaultParams.lineJoin,
        lineDash = defaultParams.lineDash,
        lineCap = defaultParams.lineCap,
        miterLimit = defaultParams.miterLimit
      } = attribute;
      _context.globalAlpha = strokeOpacity * opacity;
      _context.lineWidth = getScaledStroke(this, lineWidth, this.dpr);
      _context.strokeStyle = createColor(this, stroke as any, params, offsetX, offsetY);
      _context.lineJoin = lineJoin;
      // lynx环境中lineDash不能为[0, 0]
      if (!(lineDash[0] === 0 && lineDash[1] === 0)) {
        _context.setLineDash(lineDash);
      }
      _context.lineCap = lineCap;
      _context.miterLimit = miterLimit;
    }
  }

  createPattern(image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement, repetition: string): CanvasPattern {
    return null;
  }

  draw() {
    const _context = this.nativeContext as any;
    this.drawPromise = new Promise(resolve => {
      _context.draw(true, () => {
        this.drawPromise = null;
        resolve(null);
      });
    });
  }
}
