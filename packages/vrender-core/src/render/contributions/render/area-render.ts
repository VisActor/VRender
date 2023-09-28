import type { IPointLike } from '@visactor/vutils';
import { abs, isArray, min } from '@visactor/vutils';
import { inject, injectable, named } from '../../../common/inversify-lite';
import type {
  IArea,
  IAreaCacheItem,
  IAreaGraphicAttribute,
  IGraphicAttribute,
  IContext2d,
  ICurveType,
  IMarkAttribute,
  IThemeAttribute,
  ISegPath2D,
  IDirection,
  IAreaRenderContribution,
  IDrawContext,
  IRenderService,
  IGraphicRender,
  IGraphicRenderDrawParams,
  IContributionProvider
} from '../../../interface';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ContributionProvider } from '../../../common/contribution-provider';
import {
  genLinearSegments,
  genBasisSegments,
  genMonotoneXSegments,
  genMonotoneYSegments,
  genStepSegments,
  genLinearClosedSegments
} from '../../../common/segment';

import { getTheme } from '../../../graphic/theme';
import { drawPathProxy, fillVisible, runFill, runStroke, strokeVisible } from './utils';
import { AreaRenderContribution } from './contributions/constants';
import { BaseRenderContributionTime, Direction } from '../../../common/enums';
import { drawAreaSegments } from '../../../common/render-area';
import { AREA_NUMBER_TYPE } from '../../../graphic/constants';
import { drawSegments } from '../../../common/render-curve';
import { BaseRender } from './base-render';

function calcLineCache(
  points: IPointLike[],
  curveType: ICurveType,
  params?: { direction?: IDirection; startPoint?: IPointLike }
): ISegPath2D | null {
  switch (curveType) {
    case 'linear':
      return genLinearSegments(points, params);
    case 'basis':
      return genBasisSegments(points, params);
    case 'monotoneX':
      return genMonotoneXSegments(points, params);
    case 'monotoneY':
      return genMonotoneYSegments(points, params);
    case 'step':
      return genStepSegments(points, 0.5, params);
    case 'stepBefore':
      return genStepSegments(points, 0, params);
    case 'stepAfter':
      return genStepSegments(points, 1, params);
    case 'linearClosed':
      return genLinearClosedSegments(points, params);
    default:
      return genLinearSegments(points, params);
  }
}

@injectable()
export class DefaultCanvasAreaRender extends BaseRender<IArea> implements IGraphicRender {
  type: 'area';
  numberType: number = AREA_NUMBER_TYPE;

  constructor(
    @inject(ContributionProvider)
    @named(AreaRenderContribution)
    protected readonly areaRenderContribitions: IContributionProvider<IAreaRenderContribution>
  ) {
    super();
    this.init(areaRenderContribitions);
  }

  drawShape(
    area: IArea,
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
      markAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
      themeAttribute: IThemeAttribute
    ) => boolean
  ) {
    const areaAttribute = getTheme(area, params?.theme).area;
    const {
      fillOpacity = areaAttribute.fillOpacity,
      z = areaAttribute.z,
      strokeOpacity = areaAttribute.strokeOpacity
    } = area.attribute;

    const data = this.valid(area, areaAttribute, fillCb, strokeCb);
    if (!data) {
      return;
    }
    const { doFill, doStroke } = data;

    const { clipRange = areaAttribute.clipRange } = area.attribute;

    // 更新cache
    if (area.shouldUpdateShape()) {
      const { points, segments, closePath } = area.attribute;
      let { curveType = areaAttribute.curveType } = area.attribute;
      if (closePath && curveType === 'linear') {
        curveType = 'linearClosed';
      }
      if (segments && segments.length) {
        let startPoint: IPointLike;
        let lastTopSeg: { endX: number; endY: number };
        const topCaches = segments
          .map((seg, index) => {
            if (seg.points.length <= 1) {
              // 第一个点的话，直接设置lastTopSeg
              if (index === 0) {
                seg.points[0] && (lastTopSeg = { endX: seg.points[0].x, endY: seg.points[0].y });
                return null;
              }
            }
            // 添加上一个segment结束的点作为这个segment的起始点
            if (index === 1) {
              startPoint = { x: lastTopSeg.endX, y: lastTopSeg.endY };
            } else if (index > 1) {
              startPoint.x = lastTopSeg.endX;
              startPoint.y = lastTopSeg.endY;
            }
            const data = calcLineCache(seg.points, curveType, {
              startPoint
            });
            lastTopSeg = data;
            return data;
          })
          .filter(item => !!item);
        let lastBottomSeg: ISegPath2D;
        const bottomCaches = [];
        for (let i = segments.length - 1; i >= 0; i--) {
          const points = segments[i].points;
          const bottomPoints: IPointLike[] = [];
          for (let i = points.length - 1; i >= 0; i--) {
            bottomPoints.push({
              x: points[i].x1 ?? points[i].x,
              y: points[i].y1 ?? points[i].y
            });
          }
          // 处理一下bottom的segments，bottom的segments需要手动添加endPoints
          if (i !== 0) {
            const lastSegmentPoints = segments[i - 1].points;
            const endPoint = lastSegmentPoints[lastSegmentPoints.length - 1];
            endPoint &&
              bottomPoints.push({
                x: endPoint.x1 ?? endPoint.x,
                y: endPoint.y1 ?? endPoint.y
              });
          }
          lastBottomSeg = calcLineCache(
            bottomPoints,
            curveType === 'stepBefore' ? 'stepAfter' : curveType === 'stepAfter' ? 'stepBefore' : curveType
          );
          bottomCaches.unshift(lastBottomSeg);
        }
        area.cacheArea = bottomCaches.map((item, index) => ({
          top: topCaches[index],
          bottom: item
        }));
      } else if (points && points.length) {
        // 转换points
        const topPoints = points;
        const bottomPoints: IPointLike[] = [];
        for (let i = points.length - 1; i >= 0; i--) {
          bottomPoints.push({
            x: points[i].x1 ?? points[i].x,
            y: points[i].y1 ?? points[i].y
          });
        }
        const topCache = calcLineCache(topPoints, curveType);
        const bottomCache = calcLineCache(
          bottomPoints,
          curveType === 'stepBefore' ? 'stepAfter' : curveType === 'stepAfter' ? 'stepBefore' : curveType
        );

        area.cacheArea = { top: topCache, bottom: bottomCache };
      } else {
        area.cacheArea = null;
        area.clearUpdateShapeTag();
        return;
      }
      area.clearUpdateShapeTag();
    }

    if (Array.isArray(area.cacheArea)) {
      const segments = area.attribute.segments.filter(item => item.points.length);
      // 如果第一个seg只有一个点，那么shift出去
      if (segments[0].points.length === 1) {
        segments.shift();
      }
      if (clipRange === 1) {
        let skip = false;
        // 性能优化，不需要clip的线段不需要计算长度
        area.cacheArea.forEach((cache, index) => {
          if (skip) {
            return;
          }
          skip = this.drawSegmentItem(
            context,
            cache,
            doFill,
            fillOpacity,
            doStroke,
            strokeOpacity,
            segments[index],
            [areaAttribute, area.attribute],
            clipRange,
            x,
            y,
            z,
            area,
            drawContext,
            fillCb,
            strokeCb
          );
        });
      } else {
        // 如果是segments的话，每个clipRange需要重新计算
        // 整个线段的总长度
        const totalLength = area.cacheArea.reduce((l, c) => l + c.top.getLength(), 0);
        // 总需要绘制的长度
        const totalDrawLength = clipRange * totalLength;
        // 直到上次绘制的长度
        let drawedLengthUntilLast = 0;
        let skip = false;
        area.cacheArea.forEach((cache, index) => {
          if (skip) {
            return;
          }
          const curSegLength = cache.top.getLength();
          const _cr = (totalDrawLength - drawedLengthUntilLast) / curSegLength;
          drawedLengthUntilLast += curSegLength;
          if (_cr > 0) {
            skip = this.drawSegmentItem(
              context,
              cache,
              doFill,
              fillOpacity,
              doStroke,
              strokeOpacity,
              segments[index],
              [areaAttribute, area.attribute],
              min(_cr, 1),
              x,
              y,
              z,
              area,
              drawContext,
              fillCb,
              strokeCb
            );
          }
        });
      }
    } else {
      this.drawSegmentItem(
        context,
        area.cacheArea as IAreaCacheItem,
        doFill,
        fillOpacity,
        doStroke,
        strokeOpacity,
        area.attribute,
        areaAttribute,
        clipRange,
        x,
        y,
        z,
        area,
        drawContext,
        fillCb,
        strokeCb
      );
    }
  }

  draw(area: IArea, renderService: IRenderService, drawContext: IDrawContext, params?: IGraphicRenderDrawParams) {
    const areaAttribute = getTheme(area, params?.theme).area;
    this._draw(area, areaAttribute, false, drawContext, params);
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
    ) => boolean,
    strokeCb?: (
      ctx: IContext2d,
      lineAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
      themeAttribute: IThemeAttribute | IThemeAttribute[]
    ) => boolean
  ): boolean {
    let ret = false;
    ret =
      ret ||
      this._drawSegmentItem(
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
        false,
        fillCb,
        strokeCb
      );
    ret =
      ret ||
      this._drawSegmentItem(
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
        true,
        fillCb,
        strokeCb
      );
    return ret;
  }

  protected _drawSegmentItem(
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
    connect: boolean,
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
  ) {
    // 绘制connect区域
    let { connectedType, connectedX, connectedY, connectedStyle } = attribute;
    const da = [];
    if (connect) {
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

      if (isArray(defaultAttribute)) {
        defaultAttribute.forEach(i => da.push(i));
      } else {
        da.push(defaultAttribute);
      }
      da.push(attribute);
    }

    if (connect && connectedType === 'none') {
      return false;
    }

    if (!cache) {
      return;
    }
    context.beginPath();

    const ret: boolean = false;
    const { points, segments } = area.attribute;
    let direction = Direction.ROW;
    let endP: IPointLike;
    let startP: IPointLike;
    if (segments) {
      const endSeg = segments[segments.length - 1];
      const startSeg = segments[0];
      startP = startSeg.points[0];
      endP = endSeg.points[endSeg.points.length - 1];
    } else {
      startP = points[0];
      endP = points[points.length - 1];
    }
    const xTotalLength = abs(endP.x - startP.x);
    const yTotalLength = abs(endP.y - startP.y);
    direction = xTotalLength > yTotalLength ? Direction.ROW : Direction.COLUMN;
    drawAreaSegments(context.camera ? context : context.nativeContext, cache, clipRange, {
      offsetX,
      offsetY,
      offsetZ,
      direction,
      drawConnect: connect,
      mode: connectedType,
      zeroX: connectedX,
      zeroY: connectedY
    });

    this.beforeRenderStep(
      area,
      context,
      offsetX,
      offsetY,
      !!fillOpacity,
      false,
      fill,
      false,
      defaultAttribute as any,
      drawContext,
      fillCb,
      null,
      { attribute }
    );

    // shadow
    context.setShadowBlendStyle && context.setShadowBlendStyle(area, attribute, defaultAttribute);

    const { x: originX = 0, x: originY = 0 } = attribute;
    if (fill !== false) {
      if (fillCb) {
        fillCb(context, attribute, defaultAttribute);
      } else if (fillOpacity) {
        context.setCommonStyle(
          area,
          connect ? connectedStyle : attribute,
          originX - offsetX,
          originY - offsetY,
          connect ? da : defaultAttribute
        );
        context.fill();
      }
    }

    this.afterRenderStep(
      area,
      context,
      offsetX,
      offsetY,
      !!fillOpacity,
      false,
      fill,
      false,
      defaultAttribute as any,
      drawContext,
      fillCb,
      null,
      { attribute }
    );

    if (stroke !== false) {
      if (strokeCb) {
        strokeCb(context, attribute, defaultAttribute);
      } else {
        const { stroke = defaultAttribute && defaultAttribute[1] && defaultAttribute[1].stroke } = attribute;
        if (isArray(stroke) && (stroke[0] || stroke[2]) && stroke[1] === false) {
          context.beginPath();
          drawSegments(
            context.camera ? context : context.nativeContext,
            stroke[0] ? cache.top : cache.bottom,
            clipRange,
            direction === Direction.ROW ? 'x' : 'y',
            {
              offsetX,
              offsetY,
              offsetZ,
              drawConnect: connect,
              mode: connectedType,
              zeroX: connectedX,
              zeroY: connectedY
            }
          );
        }
        context.setStrokeStyle(
          area,
          connect ? connectedStyle : attribute,
          originX - offsetX,
          originY - offsetY,
          connect ? da : defaultAttribute
        );
        context.stroke();
      }
    }

    return ret;
  }
}
