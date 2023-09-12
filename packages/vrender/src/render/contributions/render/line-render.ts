import type { IPointLike } from '@visactor/vutils';
import { min, isArray } from '@visactor/vutils';
import { injectable } from '../../../common/inversify-lite';
import type {
  IContext2d,
  ILine,
  ILineGraphicAttribute,
  IMarkAttribute,
  IGraphicAttribute,
  IThemeAttribute,
  IClipRangeByDimensionType,
  ISegPath2D,
  IDrawContext,
  IRenderService,
  IGraphicRender,
  IGraphicRenderDrawParams
} from '../../../interface';
import { getTheme } from '../../../graphic/theme';
import { LINE_NUMBER_TYPE } from '../../../graphic/constants';
import { drawPathProxy, fillVisible, runFill, runStroke, strokeVisible } from './utils';
import { BaseRender } from './base-render';
import { mat4Allocate } from '../../../allocator/matrix-allocate';
import { drawSegments } from '../../../common/render-curve';
import { calcLineCache } from '../../../common/segment';

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
    if (!cache) {
      return;
    }
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

    const { x: originX = 0, x: originY = 0 } = attribute;
    const ret: boolean = false;
    if (fill !== false) {
      if (fillCb) {
        fillCb(context, attribute, defaultAttribute);
      } else if (fillOpacity) {
        context.setCommonStyle(line, attribute, originX - offsetX, originY - offsetY, defaultAttribute);
        context.fill();
      }
    }
    if (stroke !== false) {
      if (strokeCb) {
        strokeCb(context, attribute, defaultAttribute);
      } else if (strokeOpacity) {
        context.setStrokeStyle(line, attribute, originX - offsetX, originY - offsetY, defaultAttribute);
        context.stroke();
      }
    }

    // 绘制connect区域
    let { connectedType, connectedX, connectedY, connectedStyle } = attribute;
    if (isArray(defaultAttribute)) {
      connectedType = connectedType ?? defaultAttribute[0].connectedType ?? defaultAttribute[1].connectedType;
      connectedX = connectedX ?? defaultAttribute[0].connectedX ?? defaultAttribute[1].connectedX;
      connectedY = connectedY ?? defaultAttribute[0].connectedY ?? defaultAttribute[1].connectedY;
      connectedStyle = connectedStyle ?? defaultAttribute[0].connectedStyle ?? defaultAttribute[1].connectedStyle;
    } else {
      connectedType = connectedType ?? defaultAttribute.connectedType;
      connectedX = connectedX ?? defaultAttribute.connectedX;
      connectedY = connectedY ?? defaultAttribute.connectedY;
      connectedStyle = connectedStyle ?? defaultAttribute.connectedStyle;
    }
    // 如果有非法值就是none
    if (connectedType !== 'connect' && connectedType !== 'zero') {
      connectedType = 'none';
    }
    if (connectedType !== 'none') {
      context.beginPath();
      drawSegments(context.camera ? context : context.nativeContext, cache, clipRange, clipRangeByDimension, {
        offsetX,
        offsetY,
        offsetZ: z,
        drawConnect: true,
        mode: connectedType,
        zeroX: connectedX,
        zeroY: connectedY
      });

      const da = [];
      if (isArray(defaultAttribute)) {
        defaultAttribute.forEach(i => da.push(i));
      } else {
        da.push(defaultAttribute);
      }
      da.push(attribute);

      if (fill !== false) {
        if (fillCb) {
          fillCb(context, attribute, defaultAttribute);
        } else if (fillOpacity) {
          context.setCommonStyle(line, connectedStyle, originX - offsetX, originY - offsetY, da);
          context.fill();
        }
      }
      if (stroke !== false) {
        if (strokeCb) {
          strokeCb(context, attribute, defaultAttribute);
        } else if (strokeOpacity) {
          context.setStrokeStyle(line, connectedStyle, originX - offsetX, originY - offsetY, da);
          context.stroke();
        }
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
      fill = lineAttribute.fill,
      stroke = lineAttribute.stroke,
      opacity = lineAttribute.opacity,
      fillOpacity = lineAttribute.fillOpacity,
      strokeOpacity = lineAttribute.strokeOpacity,
      lineWidth = lineAttribute.lineWidth,
      visible = lineAttribute.visible
    } = line.attribute;

    // 不绘制或者透明
    const fVisible = fillVisible(opacity, fillOpacity, fill);
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
      const { points, segments, closePath } = line.attribute;
      let { curveType = lineAttribute.curveType } = line.attribute;
      if (closePath && curveType === 'linear') {
        curveType = 'linearClosed';
      }
      const _points = points;
      if (segments && segments.length) {
        let startPoint: IPointLike;
        let lastSeg: { endX: number; endY: number; curves: Array<{ defined: boolean }> };
        line.cache = segments
          .map((seg, index) => {
            if (seg.points.length <= 1) {
              // 第一个点的话，直接设置lastTopSeg
              if (index === 0) {
                seg.points[0] &&
                  (lastSeg = {
                    endX: seg.points[0].x,
                    endY: seg.points[0].y,
                    curves: [{ defined: seg.points[0].defined !== false }]
                  });
                return null;
              }
            }
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
            const data = calcLineCache(seg.points, curveType, {
              startPoint
            });
            lastSeg = data;
            return data;
          })
          .filter(item => !!item);

        // 如果lineClosed，那就绘制到第一个点
        if (curveType === 'linearClosed') {
          let startP: IPointLike;
          for (let i = 0; i < line.cache.length; i++) {
            const cacheItem = line.cache[i];
            for (let i = 0; i < cacheItem.curves.length; i++) {
              if (cacheItem.curves[i].defined) {
                startP = cacheItem.curves[i].p0;
                break;
              }
            }
            if (startP) {
              break;
            }
          }
          line.cache[line.cache.length - 1] && line.cache[line.cache.length - 1].lineTo(startP.x, startP.y, true);
        }
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
      const segments = line.attribute.segments.filter(item => item.points.length);
      // 如果第一个seg只有一个点，那么shift出去
      if (segments[0].points.length === 1) {
        segments.shift();
      }
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
            !!fill,
            !!stroke,
            fillOpacity,
            strokeOpacity,
            segments[index],
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
              !!fill,
              !!stroke,
              fillOpacity,
              strokeOpacity,
              segments[index],
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
        !!fill,
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
