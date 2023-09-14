import type {
  IGraphicRender,
  IRenderService,
  IGraphic,
  IContext2d,
  IMarkAttribute,
  IThemeAttribute,
  IGraphicAttribute,
  IPath,
  IDrawContext,
  IGraphicRenderDrawParams
} from '@visactor/vrender';
import { PATH_NUMBER_TYPE, DefaultCanvasPathRender, getTheme, inject, injectable } from '@visactor/vrender';
import rough from 'roughjs';
import { defaultRouthThemeSpec } from './config';

@injectable()
export class RoughCanvasPathRender implements IGraphicRender {
  type: 'path';
  numberType: number;
  style: 'rough' = 'rough';

  constructor(
    @inject(DefaultCanvasPathRender)
    public readonly canvasRenderer: IGraphicRender
  ) {
    this.type = 'path';
    this.numberType = PATH_NUMBER_TYPE;
  }

  draw(path: IPath, renderService: IRenderService, drawContext: IDrawContext, params?: IGraphicRenderDrawParams) {
    const { context } = drawContext;
    if (!context) {
      return;
    }

    // 获取到原生canvas
    const canvas = context.canvas.nativeCanvas;
    const rc = rough.canvas(canvas, {});

    context.highPerformanceSave();

    const pathAttribute = getTheme(path).path;
    context.transformFromMatrix(path.transMatrix, true);

    const {
      fill = pathAttribute.fill,
      stroke = pathAttribute.stroke,
      lineWidth = pathAttribute.lineWidth,
      path: p = pathAttribute.path,
      maxRandomnessOffset = defaultRouthThemeSpec.maxRandomnessOffset,
      roughness = defaultRouthThemeSpec.roughness,
      bowing = defaultRouthThemeSpec.bowing,
      curveFitting = defaultRouthThemeSpec.curveFitting,
      curveTightness = defaultRouthThemeSpec.curveTightness,
      curveStepCount = defaultRouthThemeSpec.curveStepCount,
      fillStyle = defaultRouthThemeSpec.fillStyle,
      fillWeight = defaultRouthThemeSpec.fillWeight,
      hachureAngle = defaultRouthThemeSpec.hachureAngle,
      hachureGap = defaultRouthThemeSpec.hachureGap,
      simplification = defaultRouthThemeSpec.simplification,
      dashOffset = defaultRouthThemeSpec.dashOffset,
      dashGap = defaultRouthThemeSpec.dashGap,
      zigzagOffset = defaultRouthThemeSpec.zigzagOffset,
      seed = defaultRouthThemeSpec.seed,
      fillLineDash = defaultRouthThemeSpec.fillLineDash,
      fillLineDashOffset = defaultRouthThemeSpec.fillLineDashOffset,
      disableMultiStroke = defaultRouthThemeSpec.disableMultiStroke,
      disableMultiStrokeFill = defaultRouthThemeSpec.disableMultiStrokeFill,
      preserveVertices = defaultRouthThemeSpec.preserveVertices,
      fixedDecimalPlaceDigits = defaultRouthThemeSpec.fixedDecimalPlaceDigits
    } = path.attribute as any;
    if (typeof p === 'string') {
      rc.path(p, {
        fill: fill ? (fill as string) : undefined,
        stroke: stroke ? (stroke as string) : undefined,
        strokeWidth: lineWidth,
        maxRandomnessOffset,
        roughness,
        bowing,
        curveFitting,
        curveTightness,
        curveStepCount,
        fillStyle,
        fillWeight,
        hachureAngle,
        hachureGap,
        simplification,
        dashOffset,
        dashGap,
        zigzagOffset,
        seed,
        fillLineDash,
        fillLineDashOffset,
        disableMultiStroke,
        disableMultiStrokeFill,
        preserveVertices,
        fixedDecimalPlaceDigits
      });
    }

    context.highPerformanceRestore();
  }
  drawShape(
    graphic: IGraphic,
    ctx: IContext2d,
    x: number,
    y: number,
    drawContext: IDrawContext,
    params?: IGraphicRenderDrawParams,
    fillCb?: (
      ctx: IContext2d,
      markAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
      themeAttribute: IThemeAttribute
    ) => boolean,
    strokeCb?: (
      ctx: IContext2d,
      markAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
      themeAttribute: IThemeAttribute
    ) => boolean
  ): void {
    if (this.canvasRenderer.drawShape) {
      return this.canvasRenderer.drawShape(graphic, ctx, x, y, drawContext, params, fillCb, strokeCb);
    }
  }
}
