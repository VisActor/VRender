import type {
  IGraphicRender,
  IAreaCacheItem,
  IContext2d,
  IMarkAttribute,
  IThemeAttribute,
  IGraphicAttribute,
  IArea,
  IAreaGraphicAttribute,
  IDrawContext
} from '@visactor/vrender';
import { drawAreaSegments, DefaultCanvasAreaRender, CustomPath2D, injectable } from '@visactor/vrender';
import rough from 'roughjs';
import { defaultRouthThemeSpec } from './config';

@injectable()
export class RoughCanvasAreaRender extends DefaultCanvasAreaRender implements IGraphicRender {
  declare type: 'area';
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
    cache: IAreaCacheItem,
    fill: boolean,
    fillOpacity: number,
    stroke: boolean,
    strokeOpacity: number,
    attribute: Partial<IAreaGraphicAttribute>,
    defaultAttribute: Required<IAreaGraphicAttribute> | Partial<IAreaGraphicAttribute>[],
    clipRange: number,
    offsetX: number,
    offsetY: number,
    offsetZ: number,
    area: IArea,
    drawContext: IDrawContext,
    fillCb?: (
      ctx: IContext2d,
      lineAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
      themeAttribute: IThemeAttribute | IThemeAttribute[]
    ) => boolean
  ): boolean {
    if (fillCb) {
      return super.drawSegmentItem(
        context,
        cache,
        fill,
        fillOpacity,
        stroke,
        strokeOpacity,
        attribute,
        defaultAttribute,
        clipRange,
        offsetX,
        offsetY,
        offsetZ,
        area,
        drawContext,
        fillCb
      );
    }
    context.highPerformanceSave();
    // 获取到原生canvas
    const canvas = context.canvas.nativeCanvas;
    const rc = rough.canvas(canvas, {});

    const customPath = new CustomPath2D();

    drawAreaSegments(customPath, cache, clipRange, {
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

    let { fill: fillColor, stroke: strokeColor, lineWidth } = attribute;

    if (Array.isArray(defaultAttribute)) {
      defaultAttribute.forEach(item => {
        fillColor = fillColor ?? item.fill;
        strokeColor = strokeColor ?? item.stroke;
        lineWidth = lineWidth ?? item.lineWidth;
      });
    } else {
      fillColor = fillColor ?? defaultAttribute.fill;
      strokeColor = strokeColor ?? defaultAttribute.stroke;
      lineWidth = lineWidth ?? defaultAttribute.lineWidth;
    }

    rc.path(customPath.toString(), {
      fill: fill ? (fillColor as string) : undefined,
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
