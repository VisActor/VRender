import { inject, injectable } from 'inversify';
import type {
  IGraphicRender,
  IRenderService,
  IRect,
  IGraphicAttribute,
  IContext2d,
  IGraphic,
  IMarkAttribute,
  IThemeAttribute,
  IDrawContext,
  IGraphicRenderDrawParams
} from '@visactor/vrender';
import { RECT_NUMBER_TYPE, DefaultCanvasRectRender, getTheme } from '@visactor/vrender';
import rough from 'roughjs';
import { defaultRouthThemeSpec } from './config';

@injectable()
export class RoughCanvasRectRender implements IGraphicRender {
  type: 'rect';
  numberType: number;
  style: 'rough' = 'rough';

  constructor(
    @inject(DefaultCanvasRectRender)
    public readonly canvasRenderer: IGraphicRender
  ) {
    this.type = 'rect';
    this.numberType = RECT_NUMBER_TYPE;
  }

  draw(rect: IRect, renderService: IRenderService, drawContext: IDrawContext, params?: IGraphicRenderDrawParams) {
    const { context } = drawContext;
    if (!context) {
      return;
    }
    // 获取到原生canvas
    const canvas = context.canvas.nativeCanvas;
    const rc = rough.canvas(canvas);

    context.highPerformanceSave();

    // const rectAttribute = graphicService.themeService.getCurrentTheme().rectAttribute;
    const rectAttribute = getTheme(rect).rect;
    let { x = rectAttribute.x, y = rectAttribute.y } = rect.attribute;
    if (!rect.transMatrix.onlyTranslate()) {
      // 性能较差
      x = 0;
      y = 0;
      context.transformFromMatrix(rect.transMatrix, true);
    } else {
      const { dx = rectAttribute.dx, dy = rectAttribute.dy } = rect.attribute;
      x += dx;
      y += dy;
      // 当前context有rotate/scale，重置matrix
      context.setTransformForCurrent();
    }

    const {
      fill = rectAttribute.fill == null ? !!rect.attribute.fillColor : rectAttribute.fill,
      stroke = rectAttribute.stroke == null ? !!rect.attribute.strokeColor : rectAttribute.stroke,
      fillColor = rectAttribute.fillColor,
      strokeColor = rectAttribute.strokeColor,
      width = rectAttribute.width,
      height = rectAttribute.height,
      lineWidth = rectAttribute.lineWidth,
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
    } = rect.attribute as any;
    rc.rectangle(x, y, width, height, {
      fill: fill ? (fillColor as string) : undefined,
      stroke: stroke ? (strokeColor as string) : undefined,
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
