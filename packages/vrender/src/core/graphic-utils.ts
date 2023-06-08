import { injectable, inject, named } from 'inversify';
import { IGraphicAttribute, ICanvas, IContext2d, EnvType, Global, IGlobal, ITextAttribute } from '../interface';
import { ITextMeasure, TextOptionsType } from './contributions/textMeasure/ITextMeasure';
import { TextMeasureContribution } from './contributions/textMeasure/textMeasure-contribution';
import { ContributionProvider } from '../common/contribution-provider';
import { wrapCanvas } from '../canvas/util';
import { DefaultTextStyle } from '../graphic/config';
import { IMatrix, IPointLike, ITextMeasureOption, Matrix, TextMeasure } from '@visactor/vutils';
import { IGraphicUtil, ITransformUtil, TransformType } from './interface';

// export interface IGraphicUtil {
//   canvas?: ICanvas;
//   context?: IContext2d | null;
//   textMeasure: ITextMeasure;
//   measureText: (text: string, tc: TextOptionsType) => { width: number; height: number };
//   bindTextMeasure: (tm: ITextMeasure) => void;
//   createTextMeasureInstance: (
//     textSpec?: Partial<ITextAttribute>,
//     option?: Partial<ITextMeasureOption>,
//     getCanvasForMeasure?: () => any
//   ) => TextMeasure<ITextAttribute>;
// }

@injectable()
export class DefaultGraphicUtil implements IGraphicUtil {
  canvas?: ICanvas;
  context?: IContext2d | null;
  _textMeasure: ITextMeasure;
  configured: boolean;

  constructor(
    @inject(ContributionProvider)
    @named(TextMeasureContribution)
    protected readonly contributions: ContributionProvider<ITextMeasure>,
    @inject(Global) public readonly global: IGlobal
  ) {
    this.configured = false;
    this.global.hooks.onSetEnv.tap('graphic-util', (lastEnv, env, global) => {
      this.configured = false;
      this.configure(global, env);
    });
  }

  get textMeasure(): ITextMeasure {
    if (!this._textMeasure) {
      this.configure(this.global, this.global.env);
    }
    return this._textMeasure;
  }

  configure(global: IGlobal, env: EnvType) {
    if (this.configured) {
      return;
    }
    const canvas = wrapCanvas({
      nativeCanvas: global.createCanvas({ width: 100, height: 100 })
    });
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.contributions.getContributions().forEach(contribution => {
      contribution.configure(this, env);
    });
    this.configured = true;
  }

  bindTextMeasure(tm: ITextMeasure) {
    this._textMeasure = tm;
  }

  measureText(
    text: string,
    tc: TextOptionsType,
    method: 'native' | 'simple' | 'quick' = 'native'
  ): { width: number; height: number } {
    this.configure(this.global, this.global.env);
    const m = this.global.measureTextMethod;
    this.global.measureTextMethod = method;
    const data = {
      width: this._textMeasure.measureTextWidth(text, tc),
      height: tc.fontSize ?? DefaultTextStyle.fontSize
    };
    this.global.measureTextMethod = m;
    return data;
  }

  createTextMeasureInstance(
    textSpec?: Partial<ITextAttribute>,
    option?: Partial<ITextMeasureOption>,
    getCanvasForMeasure?: () => any
  ) {
    this.configure(this.global, this.global.env);
    return new TextMeasure<ITextAttribute>(
      {
        defaultFontParams: {
          fontFamily: DefaultTextStyle.fontFamily,
          fontSize: DefaultTextStyle.fontSize
        },
        getCanvasForMeasure: getCanvasForMeasure || (() => this.canvas),
        getTextBounds: undefined,
        specialCharSet: '-/: .,@%\'"~' + TextMeasure.ALPHABET_CHAR_SET + TextMeasure.ALPHABET_CHAR_SET.toUpperCase(),
        ...(option ?? {})
      },
      textSpec
    );
  }
}

enum TransformMode {
  transform = 0,
  matrix = 1
}

const _matrix = new Matrix();

@injectable()
export class DefaultTransformUtil implements ITransformUtil {
  private matrix: IMatrix;
  private originTransform: TransformType;

  private outSourceMatrix: IMatrix;
  private outTargetMatrix: IMatrix;

  private mode: TransformMode;
  constructor() {
    this.matrix = new Matrix();
  }
  init(origin: TransformType): this {
    this.mode = TransformMode.transform;
    this.originTransform = origin;
    this.matrix.reset();
    return this;
  }
  fromMatrix(source: IMatrix, target: IMatrix): this {
    this.mode = TransformMode.matrix;
    this.outSourceMatrix = source;
    this.outTargetMatrix = target;
    return this;
  }

  // translate: (x: number, y: number) => Transform;
  // translateTo: (x: number, y: number) => Transform;
  private scaleMatrix(sx: number, sy: number, center?: IPointLike): this {
    // if (this.outSourceMatrix !== this.outTargetMatrix) {
    //   // copy
    //   const m = this.outSourceMatrix;
    //   this.outTargetMatrix.setValue(m.a, m.b, m.c, m.d, m.e, m.f);
    // }
    const sMatrix = this.outSourceMatrix;
    _matrix.setValue(sMatrix.a, sMatrix.b, sMatrix.c, sMatrix.d, sMatrix.e, sMatrix.f);
    this.outTargetMatrix.reset();
    if (center) {
      const { x, y } = center;
      this.outTargetMatrix.translate(x, y);
      this.outTargetMatrix.scale(sx, sy);
      this.outTargetMatrix.translate(-x, -y);
    } else {
      this.outTargetMatrix.scale(sx, sy);
    }

    // _matrix.reset();
    // if (center) {
    //   const { x, y } = center;
    //   _matrix.translate(x, y);
    //   _matrix.scale(sx, sy);
    //   _matrix.translate(-x, -y);
    // } else {
    //   _matrix.scale(sx, sy);
    // }
    this.outTargetMatrix.multiply(_matrix.a, _matrix.b, _matrix.c, _matrix.d, _matrix.e, _matrix.f);
    return this;
  }
  scale(sx: number, sy: number, center?: IPointLike): this {
    if (this.mode === TransformMode.matrix) {
      return this.scaleMatrix(sx, sy, center);
    }
    return this;
  }
  private translateMatrix(dx: number, dy: number): this {
    // if (this.outSourceMatrix !== this.outTargetMatrix) {
    //   // copy
    //   const m = this.outSourceMatrix;
    //   this.outTargetMatrix.setValue(m.a, m.b, m.c, m.d, m.e, m.f);
    // }
    const sMatrix = this.outSourceMatrix;
    _matrix.setValue(sMatrix.a, sMatrix.b, sMatrix.c, sMatrix.d, sMatrix.e, sMatrix.f);
    this.outTargetMatrix.reset();
    this.outTargetMatrix.translate(dx, dy);

    this.outTargetMatrix.multiply(_matrix.a, _matrix.b, _matrix.c, _matrix.d, _matrix.e, _matrix.f);
    return this;
  }
  translate(dx: number, dy: number): this {
    if (this.mode === TransformMode.matrix) {
      return this.translateMatrix(dx, dy);
    }
    return this;
  }
  // scaleTo: (sx: number, sy: number, center: IPointLike) => Transform;
  // rotate: (rx: number, ry: number, center: IPointLike) => Transform;
  // rotateTo: (rx: number, ry: number, center: IPointLike) => Transform;
  // 语法糖
  // interactive: (dx: number, dy: number, dsx: number, dsy: number, drx: number, dry: number) => Transform;
  // // 扩展padding像素，用于外描边，内描边
  // extend: (origin: TransformType, padding: number) => Transform;
  // 将所有的transform生成为一次的transform
  simplify(target: TransformType): this {
    if (this.mode === TransformMode.matrix) {
      return this.simplifyMatrix(target);
    }
    return this;
  }
  private simplifyMatrix(target: TransformType): this {
    // let { a, b, c, d, e, f } = this.outTargetMatrix;
    // if (a === 0 || d === 0) return this;
    // const { dx=0, dy=0 } = target;
    // // 不处理dx和dy
    // e -= dx;
    // f -= dy;
    // const tanTheta = b / a;
    // const angle = Math.atan(tanTheta);
    // const cosTheta = cos(angle);
    // const sinTheta = sin(angle);
    // const sx = cosTheta !== 0 ? (a / cosTheta) : (b / sinTheta);
    // const sy = sinTheta !== 0 ? (-c / sinTheta) : (d / cosTheta);
    // const x = e;
    // const y = f;
    // target.x = x;
    // target.y = y;
    // target.dx = dx;
    return this;
  }
}
