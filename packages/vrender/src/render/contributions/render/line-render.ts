import { min, IPointLike, isArray } from '@visactor/vutils';
import { injectable } from 'inversify';
import { ISegPath2D, drawSegments, calcLineCache } from '../../../common';
import {
  IContext2d,
  ILine,
  ILineGraphicAttribute,
  IMarkAttribute,
  IGraphicAttribute,
  IThemeAttribute,
  IClipRangeByDimensionType
} from '../../../interface';
import { getTheme, LINE_NUMBER_TYPE } from '../../../graphic';
import { IDrawContext, IRenderService } from '../../render-service';
import { IGraphicRender, IGraphicRenderDrawParams } from './graphic-render';
import { drawPathProxy, fillVisible, runFill, runStroke, strokeVisible } from './utils';
import { BaseRender } from './base-render';
import { mat4Allocate } from '../../../modules';

/**
 * 默认的基于canvas的line渲染器
 * 单例
 */
@injectable()
export class DefaultCanvasLineRender extends BaseRender<ILine> implements IGraphicRender {
  type: 'line';
  numberType: number = LINE_NUMBER_TYPE;
  declare z: number;

  draw(line: ILine, renderService: IRenderService, drawContext: IDrawContext, params?: IGraphicRenderDrawParams) {
    const { context } = drawContext;

    context.highPerformanceSave();

    // const lineAttribute = graphicService.themeService.getCurrentTheme().lineAttribute;
    const lineAttribute = getTheme(line, params?.theme).line;
    const data = this.transform(line, lineAttribute, context);
    const { x, y, z, lastModelMatrix } = data;

    this.z = z;

    if (drawPathProxy(line, context, x, y, drawContext)) {
      context.highPerformanceRestore();
      return;
    }

    this.drawShape(line, context, x, y, drawContext, params);
    this.z = 0;

    if (context.modelMatrix !== lastModelMatrix) {
      mat4Allocate.free(context.modelMatrix);
    }
    context.modelMatrix = lastModelMatrix;

    context.highPerformanceRestore();
  }

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
    context.beginPath();

    const z = this.z ?? 0;

    drawSegments(context.camera ? context : context.nativeContext, cache, clipRange, clipRangeByDimension, {
      offsetX,
      offsetY,
      offsetZ: z
    });

    // 如果是一根线，且是Closed，需要close
    if (line.cache && !isArray(line.cache) && line.attribute.curveType && line.attribute.curveType.includes('Closed')) {
      context.closePath();
    }

    // shadow
    context.setShadowStyle && context.setShadowStyle(line, attribute, defaultAttribute);

    const ret: boolean = false;
    if (fill !== false) {
      if (fillCb) {
        fillCb(context, attribute, defaultAttribute);
      } else if (fillOpacity) {
        context.setCommonStyle(line, attribute, offsetX, offsetY, defaultAttribute);
        context.fill();
      }
    }
    if (stroke !== false) {
      if (strokeCb) {
        strokeCb(context, attribute, defaultAttribute);
      } else if (strokeOpacity) {
        context.setStrokeStyle(line, attribute, offsetX, offsetY, defaultAttribute);
        context.stroke();
      }
    }
    return !!ret;
  }

  drawShape(
    line: ILine,
    context: IContext2d,
    x: number,
    y: number,
    drawContext: IDrawContext,
    params?: IGraphicRenderDrawParams,
    fillCb?: (
      ctx: IContext2d,
      lineAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
      themeAttribute: IThemeAttribute
    ) => boolean,
    strokeCb?: (
      ctx: IContext2d,
      lineAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
      themeAttribute: IThemeAttribute
    ) => boolean
  ) {
    // const lineAttribute = graphicService.themeService.getCurrentTheme().lineAttribute;
    const lineAttribute = getTheme(line, params?.theme).line;

    const {
      fill = lineAttribute.fill == null ? !!line.attribute.fillColor : lineAttribute.fill,
      stroke = lineAttribute.stroke == null ? !!line.attribute.strokeColor : lineAttribute.stroke,
      opacity = lineAttribute.opacity,
      fillOpacity = lineAttribute.fillOpacity,
      strokeOpacity = lineAttribute.strokeOpacity,
      lineWidth = lineAttribute.lineWidth,
      visible = lineAttribute.visible
    } = line.attribute;

    // 不绘制或者透明
    const fVisible = fillVisible(opacity, fillOpacity);
    const sVisible = strokeVisible(opacity, strokeOpacity);
    const doFill = runFill(fill);
    const doStroke = runStroke(stroke, lineWidth);

    if (!(line.valid && visible)) {
      return;
    }

    if (!(doFill || doStroke)) {
      return;
    }

    // 如果存在fillCb和strokeCb，那就不直接跳过
    if (!(fVisible || sVisible || fillCb || strokeCb)) {
      return;
    }

    // 更新cache
    if (line.shouldUpdateShape()) {
      const { points, segments, curveType = lineAttribute.curveType } = line.attribute;
      const _points = points;
      if (segments && segments.length) {
        let startPoint: IPointLike;
        let lastSeg: ISegPath2D;
        line.cache = segments.map((seg, index) => {
          // 添加上一个segment结束的点作为这个segment的起始点
          if (index === 1) {
            startPoint = {
              x: lastSeg.endX,
              y: lastSeg.endY,
              defined: lastSeg.curves[lastSeg.curves.length - 1].defined
            };
          } else if (index > 1) {
            startPoint.x = lastSeg.endX;
            startPoint.y = lastSeg.endY;
            startPoint.defined = lastSeg.curves[lastSeg.curves.length - 1].defined;
          }
          lastSeg = calcLineCache(seg.points, curveType, {
            startPoint
          });
          return lastSeg;
        });
      } else if (points && points.length) {
        line.cache = calcLineCache(_points, curveType);
      } else {
        line.cache = null;
        line.clearUpdateShapeTag();
        return;
      }
      line.clearUpdateShapeTag();
    }

    const { clipRange = lineAttribute.clipRange, clipRangeByDimension = lineAttribute.clipRangeByDimension } =
      line.attribute;

    if (Array.isArray(line.cache)) {
      if (clipRange === 1) {
        let skip = false;
        // 性能优化，不需要clip的线段不需要计算长度
        line.cache.forEach((cache, index) => {
          if (skip) {
            return;
          }
          skip = this.drawSegmentItem(
            context,
            cache,
            fill,
            !!stroke,
            fillOpacity,
            strokeOpacity,
            line.attribute.segments[index],
            [lineAttribute, line.attribute],
            clipRange,
            clipRangeByDimension,
            x,
            y,
            line,
            fillCb,
            strokeCb
          );
        });
      } else {
        // 如果是segments的话，每个clipRange需要重新计算
        // 整个线段的总长度
        const totalLength = line.cache.reduce((l, c) => l + c.getLength(), 0);
        // 总需要绘制的长度
        const totalDrawLength = clipRange * totalLength;
        // 直到上次绘制的长度
        let drawedLengthUntilLast = 0;
        let skip = false;
        line.cache.forEach((cache, index) => {
          if (skip) {
            return;
          }
          const curSegLength = cache.getLength();
          const _cr = (totalDrawLength - drawedLengthUntilLast) / curSegLength;
          drawedLengthUntilLast += curSegLength;
          if (_cr > 0) {
            skip = this.drawSegmentItem(
              context,
              cache,
              fill,
              !!stroke,
              fillOpacity,
              strokeOpacity,
              line.attribute.segments[index],
              [lineAttribute, line.attribute],
              min(_cr, 1),
              clipRangeByDimension,
              x,
              y,
              line,
              fillCb,
              strokeCb
            );
          }
        });
      }
    } else {
      this.drawSegmentItem(
        context,
        line.cache as ISegPath2D,
        fill,
        !!stroke,
        fillOpacity,
        strokeOpacity,
        line.attribute,
        lineAttribute,
        clipRange,
        clipRangeByDimension,
        x,
        y,
        line,
        fillCb,
        strokeCb
      );
    }
  }
}
