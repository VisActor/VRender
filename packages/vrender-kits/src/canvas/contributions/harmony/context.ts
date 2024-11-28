// 参考konva
import { injectable, createColor, getScaledStroke, application } from '@visactor/vrender-core';
import type {
  IContext2d,
  EnvType,
  ISetStrokeStyleParams,
  IStrokeStyleParams,
  ITextStyleParams
} from '@visactor/vrender-core';
import { BrowserContext2d } from '../browser';
import { getContextFont } from '@visactor/vutils';

@injectable()
export class HarmonyContext2d extends BrowserContext2d implements IContext2d {
  static env: EnvType = 'harmony';

  declare drawPromise?: Promise<any>;

  declare _globalAlpha: number;

  get globalAlpha(): number {
    return this._globalAlpha;
  }
  set globalAlpha(ga: number) {
    this.nativeContext.globalAlpha = ga * this.baseGlobalAlpha;
    this._globalAlpha = ga * this.baseGlobalAlpha;
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
      lineDash && _context.setLineDash(lineDash);
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
        miterLimit = defaultParams.miterLimit,
        keepStrokeScale = defaultParams.keepStrokeScale
      } = attribute;
      _context.globalAlpha = strokeOpacity * opacity * this.baseGlobalAlpha;
      _context.lineWidth = keepStrokeScale ? lineWidth : getScaledStroke(this, lineWidth, this.dpr);
      _context.strokeStyle = createColor(this, stroke as any, params, offsetX, offsetY);
      _context.lineJoin = lineJoin;
      // lynx环境中lineDash不能为[0, 0]
      if (!(lineDash[0] === 0 && lineDash[1] === 0)) {
        lineDash && _context.setLineDash(lineDash);
      }
      _context.lineCap = lineCap;
      _context.miterLimit = miterLimit;
    }
  }

  measureText(
    text: string,
    method: 'native' | 'simple' | 'quick' = application.global.measureTextMethod
  ): { width: number } {
    this.setTransform(1, 0, 0, 1, 0, 0, true, application.global.devicePixelRatio);
    const data = super.measureText(text, method);
    return data;
  }

  setTextStyleWithoutAlignBaseline(params: Partial<ITextStyleParams>, defaultParams?: ITextStyleParams, z?: number) {
    const _context = this.nativeContext;
    if (!defaultParams) {
      defaultParams = this.textAttributes;
    }
    const { scaleIn3d = defaultParams.scaleIn3d } = params;
    let font = '';
    if (params.font) {
      font = params.font;
    } else {
      font = getContextFont(params, defaultParams, scaleIn3d && this.camera && this.camera.getProjectionScale(z));
    }
    _context.font = (font || '').replace('px', 'vp');
    const { fontFamily = defaultParams.fontFamily, fontSize = defaultParams.fontSize } = params;
    this.fontFamily = fontFamily;
    this.fontSize = fontSize;
    _context.textAlign = 'left';
    _context.textBaseline = 'alphabetic';
    // // 这里不使用defaultParams
    // _context.textAlign = params.textAlign || 'left';
    // _context.textBaseline = params.textBaseline || 'alphabetic';
  }
  setTextStyle(params: Partial<ITextStyleParams>, defaultParams?: ITextStyleParams, z?: number) {
    const _context = this.nativeContext;
    if (!defaultParams) {
      defaultParams = this.textAttributes;
    }
    let font = '';
    if (params.font) {
      font = params.font;
    } else {
      font = getContextFont(params, defaultParams, this.camera && this.camera.getProjectionScale(z));
    }
    _context.font = (font || '').replace('px', 'vp');
    const { fontFamily = defaultParams.fontFamily, fontSize = defaultParams.fontSize } = params;
    this.fontFamily = fontFamily;
    this.fontSize = fontSize;
    _context.textAlign = params.textAlign ?? defaultParams.textAlign;
    _context.textBaseline = params.textBaseline ?? defaultParams.textBaseline;
  }

  createPattern(image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement, repetition: string): CanvasPattern {
    return null;
  }

  drawImage(
    image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ImageBitmap,
    dstX: number,
    dstY: number
  ): void;
  drawImage(
    image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ImageBitmap,
    dstX: number,
    dstY: number,
    dstW: number,
    dstH: number
  ): void;
  drawImage(
    image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ImageBitmap,
    srcX: number,
    srcY: number,
    srcW: number,
    srcH: number,
    dstX: number,
    dstY: number,
    dstW: number,
    dstH: number
  ): void;
  drawImage(): void {
    const _context = this.nativeContext;
    const a = arguments;
    if (a[0].drawImage) {
      a[0] = a[0].transferToImageBitmap();
    }
    if (a.length === 3) {
      _context.drawImage(a[0], a[1], a[2]);
    } else if (a.length === 5) {
      _context.drawImage(a[0], a[1], a[2], a[3], a[4]);
    } else if (a.length === 9) {
      _context.drawImage(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8]);
    }
  }

  draw() {
    return;
  }
}
