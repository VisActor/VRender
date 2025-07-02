import type { IRenderService } from '@visactor/vrender-core';
import {
  type IGraphicAttribute,
  type IContext2d,
  type IGraphic,
  type IMarkAttribute,
  type IThemeAttribute,
  type IDrawContext,
  type IGraphicRenderDrawParams,
  type IGraphicRender,
  CustomPath2D
} from '@visactor/vrender-core';
import rough from 'roughjs';
import { RoughContext2d } from './context';
import { defaultRouthThemeSpec } from './config';

export abstract class RoughBaseRender {
  canvasRenderer!: IGraphicRender;
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

  doDraw(
    graphic: IGraphic,
    renderService: IRenderService,
    drawContext: IDrawContext,
    params?: IGraphicRenderDrawParams
  ) {
    const { context } = drawContext;
    if (!context) {
      return;
    }
    // 获取到原生canvas
    const canvas = context.canvas.nativeCanvas;
    const rc = rough.canvas(canvas);

    // context.highPerformanceSave();

    const customPath = new CustomPath2D();
    const roughContext = new RoughContext2d(context, customPath);

    context.save();
    // 不管怎么样，都transform
    context.transformFromMatrix(graphic.transMatrix, true);

    const { fill, stroke, roughStyle = {}, lineWidth } = graphic.attribute as any;

    const {
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
    } = roughStyle;

    let rendered = false;
    const doRender = () => {
      if (rendered) {
        return;
      }
      rendered = true;
      const path = customPath.toString();
      context.beginPath();
      rc.path(path, {
        fill,
        stroke,
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
    };
    this.canvasRenderer.drawShape(
      graphic,
      roughContext,
      0,
      0,
      drawContext,
      params,
      () => {
        doRender();
        return false;
      },
      () => {
        doRender();
        return false;
      }
    );

    context.restore();

    // context.highPerformanceRestore();
  }
  reInit() {
    this.canvasRenderer?.reInit();
  }
}
