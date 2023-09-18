// 参考konva
import { injectable, createColor, getScaledStroke, getContextFont } from '@visactor/vrender-core';
import type {
  ICommonStyleParams,
  IContext2d,
  ISetCommonStyleParams,
  ISetStrokeStyleParams,
  IStrokeStyleParams,
  ITextStyleParams,
  IConicalGradientData,
  EnvType
} from '@visactor/vrender-core';
import { BrowserContext2d } from '../browser';

// 考虑taro-feishu等环境
interface ITTContext {
  setFillStyle: (c: string | CanvasGradient) => void;
  setStrokeStyle: (c: string | CanvasGradient) => void;
  setGlobalAlpha: (alpha: number) => void;
  setLineWidth: (width: number) => void;
  setMiterLimit: (limit: number) => void;
  setLineJoin: (lineJoin: string) => void;
  setLineCap: (lineCap: string) => void;
  setTextAlign: (align: string) => void;
  setTextBaseline: (baseline: string) => void;
  setLineDash: (lineDash: number[]) => void;
  setFontSize: ((size: number) => void) & ((fontSize: number) => void);
  font: string;
}

@injectable()
export class TaroContext2d extends BrowserContext2d implements IContext2d {
  static env: EnvType = 'taro';

  declare nativeContext: ITTContext;

  declare _globalAlpha: number;

  // feishu小程序无法正常获取到globalAlpha
  get globalAlpha(): number {
    return this._globalAlpha;
  }
  set globalAlpha(ga: number) {
    this.nativeContext.setGlobalAlpha(ga);
    this._globalAlpha = ga;
  }

  draw() {
    const _context = this.nativeContext as any;
    _context.draw();
  }

  strokeText(text: string, x: number, y: number) {
    return;
  }

  _setCommonStyle(
    params: ISetCommonStyleParams,
    attribute: ICommonStyleParams,
    // 用于渐变色
    offsetX: number,
    offsetY: number,
    defaultParams?: ICommonStyleParams
  ) {
    const _context = this.nativeContext;
    if (!defaultParams) {
      defaultParams = this.fillAttributes;
    }
    const {
      fillOpacity = defaultParams.fillOpacity,
      opacity = defaultParams.opacity,
      fill = defaultParams.fill
    } = attribute;
    if (fillOpacity > 1e-12 && opacity > 1e-12) {
      _context.setGlobalAlpha(fillOpacity * opacity);
      _context.setFillStyle(createColor(this, fill, params, offsetX, offsetY));
      // todo 小程序
    } else {
      // _context.setGlobalAlpha(fillOpacity * opacity);
    }
  }

  _setStrokeStyle(
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
      _context.setGlobalAlpha(strokeOpacity * opacity);
      _context.setLineWidth(getScaledStroke(this, lineWidth, this.dpr));
      _context.setStrokeStyle(createColor(this, stroke as any, params, offsetX, offsetY));
      _context.setLineJoin(lineJoin);
      _context.setLineDash(lineDash);
      _context.setLineCap(lineCap);
      _context.setMiterLimit(miterLimit);
    }
  }
  setTextStyleWithoutAlignBaseline(params: Partial<ITextStyleParams>, defaultParams?: ITextStyleParams) {
    const _context = this.nativeContext;
    if (!defaultParams) {
      defaultParams = this.textAttributes;
    }
    if (params.font) {
      _context.font = params.font;
    } else {
      _context.font = getContextFont(params, defaultParams);
    }
    _context.setFontSize(params.fontSize ?? defaultParams.fontSize);
    // // 这里不使用defaultParams
    // _context.textAlign = params.textAlign || 'left';
    // _context.textBaseline = params.textBaseline || 'alphabetic';
  }
  setTextStyle(params: Partial<ITextStyleParams>, defaultParams?: ITextStyleParams) {
    const _context = this.nativeContext;
    if (!defaultParams) {
      defaultParams = this.textAttributes;
    }
    if (params.font) {
      _context.font = params.font;
    } else {
      _context.font = getContextFont(params, defaultParams);
    }
    _context.setTextAlign(params.textAlign ?? defaultParams.textAlign);
    _context.setTextBaseline(params.textBaseline ?? defaultParams.textBaseline);
  }
  createConicGradient(x: number, y: number, startAngle: number, endAngle: number): IConicalGradientData {
    return null;
  }

  createPattern(image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement, repetition: string): CanvasPattern {
    return null;
  }
}
