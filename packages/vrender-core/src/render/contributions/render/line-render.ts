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
import { BaseRender } from './base-render';
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
    const lineAttribute = getTheme(line, params?.theme).line;
    this._draw(line, lineAttribute, false, drawContext, params);
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

    // 如果是一根线，且是Closed，并且没有defined为false的点，需要close
    if (
      line.cache &&
      !isArray(line.cache) &&
      line.cache.curves.every(c => c.defined) &&
      line.attribute.curveType &&
      line.attribute.curveType.includes('Closed')
    ) {
      context.closePath();
    }

    // shadow
    context.setShadowBlendStyle && context.setShadowBlendStyle(line, attribute, defaultAttribute);

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
    return !!ret;
  }

  // 高性能绘制linear line，不用拆分
  drawLinearLineHighPerformance(
    line: ILine,
    context: IContext2d,
    fill: boolean,
    stroke: boolean,
    fillOpacity: number,
    strokeOpacity: number,
    offsetX: number,
    offsetY: number,
    lineAttribute: Required<ILineGraphicAttribute>,
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
    context.beginPath();

    const z = this.z ?? 0;
    const { points } = line.attribute;
    const startP = points[0];

    context.moveTo(startP.x + offsetX, startP.y + offsetY, z);
    for (let i = 1; i < points.length; i++) {
      const p = points[i];
      context.lineTo(p.x + offsetX, p.y + offsetY, z);
    }

    // shadow
    context.setShadowBlendStyle && context.setShadowBlendStyle(line, line.attribute, lineAttribute);

    const { x: originX = 0, x: originY = 0 } = line.attribute;
    if (fill !== false) {
      if (fillCb) {
        fillCb(context, line.attribute, lineAttribute);
      } else if (fillOpacity) {
        context.setCommonStyle(line, line.attribute, originX - offsetX, originY - offsetY, lineAttribute);
        context.fill();
      }
    }
    if (stroke !== false) {
      if (strokeCb) {
        strokeCb(context, line.attribute, lineAttribute);
      } else if (strokeOpacity) {
        context.setStrokeStyle(line, line.attribute, originX - offsetX, originY - offsetY, lineAttribute);
        context.stroke();
      }
    }
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
      fillOpacity = lineAttribute.fillOpacity,
      strokeOpacity = lineAttribute.strokeOpacity,
      segments,
      points,
      closePath,
      curveTension = lineAttribute.curveTension,
      connectedType = lineAttribute.connectedType
    } = line.attribute;

    const data = this.valid(line, lineAttribute, fillCb, strokeCb);
    if (!data) {
      return;
    }

    let { curveType = lineAttribute.curveType } = line.attribute;
    if (closePath && curveType === 'linear') {
      curveType = 'linearClosed';
    }

    const { clipRange = lineAttribute.clipRange, clipRangeByDimension = lineAttribute.clipRangeByDimension } =
      line.attribute;

    if (clipRange === 1 && !segments && !points.some(p => p.defined === false) && curveType === 'linear') {
      return this.drawLinearLineHighPerformance(
        line,
        context,
        !!fill,
        !!stroke,
        fillOpacity,
        strokeOpacity,
        x,
        y,
        lineAttribute,
        drawContext,
        params,
        fillCb,
        strokeCb
      );
    }
    // const { fVisible, sVisible, doFill, doStroke } = data;

    function parsePoint(points: IPointLike[], connectedType: 'none' | 'connect') {
      if (connectedType === 'none') {
        return points;
      }
      return points.filter(p => p.defined !== false);
    }

    // 更新cache
    if (line.shouldUpdateShape()) {
      const { points, segments } = line.attribute;

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
            const data = calcLineCache(parsePoint(seg.points, connectedType), curveType, {
              startPoint,
              curveTension
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
        line.cache = calcLineCache(parsePoint(_points, connectedType), curveType, { curveTension });
      } else {
        line.cache = null;
        line.clearUpdateShapeTag();
        return;
      }
      line.clearUpdateShapeTag();
    }

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
