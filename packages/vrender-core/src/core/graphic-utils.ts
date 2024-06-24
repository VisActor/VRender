import { injectable, inject, named } from '../common/inversify-lite';
import type {
  ICanvas,
  IContext2d,
  EnvType,
  IGlobal,
  ITextAttribute,
  IContributionProvider,
  IGraphic,
  IGraphicAttribute,
  IStage,
  IWindow
} from '../interface';
import type { ITextMeasure, TextOptionsType } from '../interface/text';
import { TextMeasureContribution } from './contributions/textMeasure/textMeasure-contribution';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ContributionProvider } from '../common/contribution-provider';
import { DefaultTextStyle } from '../graphic/config';
import type { IMatrix, IPointLike, ITextMeasureOption } from '@visactor/vutils';
import { Matrix, TextMeasure } from '@visactor/vutils';
import type { IGraphicUtil, ITransformUtil, TransformType } from '../interface/core';
import { canvasAllocate } from '../allocator/canvas-allocate';
import { application } from '../application';
import { container } from '../container';
import { VWindow } from './window';

@injectable()
export class DefaultGraphicUtil implements IGraphicUtil {
  get canvas(): ICanvas {
    this.tryInitCanvas();
    return this._canvas;
  }
  get context(): IContext2d | null {
    this.tryInitCanvas();
    return this._context;
  }
  _canvas?: ICanvas;
  _context?: IContext2d | null;
  _textMeasure: ITextMeasure;
  configured: boolean;
  global: IGlobal;

  constructor(
    @inject(ContributionProvider)
    @named(TextMeasureContribution)
    protected readonly contributions: IContributionProvider<ITextMeasure>
  ) {
    this.configured = false;
    this.global = application.global;
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
    this.contributions.getContributions().forEach(contribution => {
      contribution.configure(this, env);
    });
    this.configured = true;
  }

  tryInitCanvas() {
    if (!this._canvas) {
      const canvas = canvasAllocate.shareCanvas();
      this._canvas = canvas;
      this._context = canvas.getContext('2d');
    }
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

  drawGraphicToCanvas(
    graphic: IGraphic<Partial<IGraphicAttribute>>,
    stage: IStage,
    canvas?: HTMLCanvasElement
  ): HTMLCanvasElement | null | Promise<HTMLCanvasElement> {
    if (!stage.defaultLayer) {
      return null;
    }
    const window = container.get<IWindow>(VWindow);
    const bounds = graphic.AABBBounds;
    const width = bounds.width();
    const height = bounds.height();
    const x1 = -bounds.x1;
    const y1 = -bounds.y1;
    window.create({
      viewBox: { x1, y1, x2: bounds.x2, y2: bounds.y2 },
      width,
      height,
      canvas,
      dpr: stage.window.dpr,
      canvasControled: true,
      offscreen: true,
      title: ''
    });

    const disableCheckGraphicWidthOutRange = stage.params.optimize.disableCheckGraphicWidthOutRange;
    // 关掉dirtyBounds检测
    stage.params.optimize.disableCheckGraphicWidthOutRange = true;
    stage.defaultLayer.getNativeHandler().drawTo(window, [graphic as any], {
      transMatrix: window.getViewBoxTransform(),
      viewBox: window.getViewBox(),
      stage,
      layer: stage.defaultLayer,
      renderService: stage.renderService,
      background: 'transparent',
      clear: true, // 第一个layer需要clear
      updateBounds: false
    });
    stage.params.optimize.disableCheckGraphicWidthOutRange = disableCheckGraphicWidthOutRange;

    const c = window.getNativeHandler();
    if (c.nativeCanvas) {
      return c.nativeCanvas;
    }
    return null;
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

  private rotateMatrix(angle: number, center?: IPointLike): this {
    const sMatrix = this.outSourceMatrix;
    _matrix.setValue(sMatrix.a, sMatrix.b, sMatrix.c, sMatrix.d, sMatrix.e, sMatrix.f);
    this.outTargetMatrix.reset();
    if (center) {
      const { x, y } = center;
      this.outTargetMatrix.translate(x, y);
      this.outTargetMatrix.rotate(angle);
      this.outTargetMatrix.translate(-x, -y);
    } else {
      this.outTargetMatrix.rotate(angle);
    }

    this.outTargetMatrix.multiply(_matrix.a, _matrix.b, _matrix.c, _matrix.d, _matrix.e, _matrix.f);
    return this;
  }
  scale(sx: number, sy: number, center?: IPointLike): this {
    if (this.mode === TransformMode.matrix) {
      return this.scaleMatrix(sx, sy, center);
    }
    return this;
  }
  rotate(angle: number, center?: IPointLike): this {
    if (this.mode === TransformMode.matrix) {
      return this.rotateMatrix(angle, center);
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
