import { inject, injectable } from 'inversify';
import type {
  IGraphicRender,
  IContext2d,
  IMarkAttribute,
  IThemeAttribute,
  IGraphicAttribute,
  ISegPath2D,
  ILine,
  ILineGraphicAttribute,
  IClipRangeByDimensionType
} from '@visactor/vrender';
import { IRenderService, IGraphic, DefaultCanvasLineRender, getTheme, CustomPath2D, drawSegments } from '@visactor/vrender';
import rough from 'roughjs';
import { defaultRouthThemeSpec } from './config';

@injectable()
export class RoughCanvasLineRender extends DefaultCanvasLineRender implements IGraphicRender {
  declare type: 'line';
  declare numberType: number;
  style: 'rough' = 'rough';

  /**
   * 绘制segment
   * @param context
   * @param cache
   * @param fill
   * @param stroke
   * @param attribute
   * @param defaultAttribute
   * @param clipRange
   * @param offsetX
   * @param offsetY
   * @param fillCb
   * @param strokeCb
   * @returns 返回true代表跳过后续绘制
   */
  protected drawSegmentItem(
    context: IContext2d,
    cache: ISegPath2D,
    fill: boolean,
    stroke: boolean,
    fillOpacity: number,
    strokeOpacity: number,
    attribute: Partial<ILineGraphicAttribute>,
    defaultAttribute: Required<ILineGraphicAttribute> | Partial<ILineGraphicAttribute>[],
    clipRange: number,
    clipRangeByDimension: IClipRangeByDimensionType,
    offsetX: number,
    offsetY: number,
    line: ILine,
    fillCb?: (
      ctx: IContext2d,
      lineAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
      themeAttribute: IThemeAttribute | IThemeAttribute[]
    ) => boolean,
    strokeCb?: (
      ctx: IContext2d,
      lineAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
      themeAttribute: IThemeAttribute | IThemeAttribute[]
    ) => boolean
  ): boolean {
    if (fillCb || strokeCb) {
      return super.drawSegmentItem(
        context,
        cache,
        fill,
        stroke,
        fillOpacity,
        strokeOpacity,
        attribute,
        defaultAttribute,
        clipRange,
        clipRangeByDimension,
        offsetX,
        offsetY,
        line,
        fillCb,
        strokeCb
      );
    }
    context.highPerformanceSave();
    // 获取到原生canvas
    const canvas = context.canvas.nativeCanvas;
    const rc = rough.canvas(canvas, {});

    const customPath = new CustomPath2D();

    drawSegments(context.camera ? context : context.nativeContext, cache, clipRange, clipRangeByDimension, {
      offsetX,
      offsetY
    });
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
    } = attribute as any;

    let { fillColor, strokeColor, lineWidth } = attribute;

    if (Array.isArray(defaultAttribute)) {
      defaultAttribute.forEach(item => {
        fillColor = fillColor ?? item.fillColor;
        strokeColor = strokeColor ?? item.strokeColor;
        lineWidth = lineWidth ?? item.lineWidth;
      });
    } else {
      fillColor = fillColor ?? defaultAttribute.fillColor;
      strokeColor = strokeColor ?? defaultAttribute.strokeColor;
      lineWidth = lineWidth ?? defaultAttribute.lineWidth;
    }

    rc.path(customPath.toString(), {
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

    return false;
  }
}
