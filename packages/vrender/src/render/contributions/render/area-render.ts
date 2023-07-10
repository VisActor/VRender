import type { IPointLike } from '@visactor/vutils';
import { min } from '@visactor/vutils';
import { inject, injectable, named } from 'inversify';
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
import { BaseRenderContributionTime } from '../../../common/enums';
import { drawAreaSegments } from '../../../common/render-area';
import { AREA_NUMBER_TYPE } from '../../../graphic/constants';

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
export class DefaultCanvasAreaRender implements IGraphicRender {
  type: 'area';
  numberType: number = AREA_NUMBER_TYPE;

  protected _areaRenderContribitions: IAreaRenderContribution[];
  constructor(
    @inject(ContributionProvider)
    @named(AreaRenderContribution)
    protected readonly areaRenderContribitions: IContributionProvider<IAreaRenderContribution>
  ) {}

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
      fill = areaAttribute.fill,
      fillOpacity = areaAttribute.fillOpacity,
      opacity = areaAttribute.opacity,
      visible = areaAttribute.visible,
      z = areaAttribute.z,
      stroke = area.attribute.stroke,
      lineWidth = areaAttribute.lineWidth,
      strokeOpacity = areaAttribute.strokeOpacity
    } = area.attribute;

    // 不绘制或者透明
    const fVisible = fillVisible(opacity, fillOpacity);
    const doFill = runFill(fill);
    const doStroke = runStroke(stroke, lineWidth);
    const sVisible = strokeVisible(opacity, strokeOpacity);

    if (!(area.valid && visible)) {
      return;
    }

    if (!doFill && !doStroke) {
      return;
    }

    // 如果存在fillCb和strokeCb，那就不直接跳过
    if (!(fVisible || fillCb) && !sVisible && !strokeCb) {
      return;
    }

    const { clipRange = areaAttribute.clipRange } = area.attribute;

    // 更新cache
    if (area.shouldUpdateShape()) {
      const { points, segments, curveType = areaAttribute.curveType } = area.attribute;
      if (segments && segments.length) {
        let startPoint: IPointLike;
        let lastTopSeg: ISegPath2D;
        const topCaches = segments.map((seg, index) => {
          // 添加上一个segment结束的点作为这个segment的起始点
          if (index === 1) {
            startPoint = { x: lastTopSeg.endX, y: lastTopSeg.endY };
          } else if (index > 1) {
            startPoint.x = lastTopSeg.endX;
            startPoint.y = lastTopSeg.endY;
          }
          lastTopSeg = calcLineCache(seg.points, curveType, {
            startPoint
          });
          return lastTopSeg;
        });
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
          lastBottomSeg = calcLineCache(bottomPoints, curveType);
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
        area.cache = null;
        area.clearUpdateShapeTag();
        return;
      }
      area.clearUpdateShapeTag();
    }

    if (Array.isArray(area.cacheArea)) {
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
            !!fill,
            fillOpacity,
            area.attribute.segments[index],
            [areaAttribute, area.attribute],
            clipRange,
            x,
            y,
            z,
            area,
            drawContext,
            fillCb
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
              !!fill,
              fillOpacity,
              area.attribute.segments[index],
              [areaAttribute, area.attribute],
              min(_cr, 1),
              x,
              y,
              z,
              area,
              drawContext,
              fillCb
            );
          }
        });
      }
    } else {
      this.drawSegmentItem(
        context,
        area.cacheArea as IAreaCacheItem,
        !!fill,
        fillOpacity,
        area.attribute,
        areaAttribute,
        clipRange,
        x,
        y,
        z,
        area,
        drawContext,
        fillCb
      );
    }
  }

  draw(area: IArea, renderService: IRenderService, drawContext: IDrawContext, params?: IGraphicRenderDrawParams) {
    const { context } = drawContext;

    // const areaAttribute = graphicService.themeService.getCurrentTheme().areaAttribute;
    const areaAttribute = getTheme(area, params?.theme).area;
    let { x = areaAttribute.x, y = areaAttribute.y } = area.attribute;

    context.highPerformanceSave();

    if (!area.transMatrix.onlyTranslate()) {
      // 性能较差
      x = 0;
      y = 0;
      context.transformFromMatrix(area.transMatrix, true);
    } else {
      const point = area.getOffsetXY(areaAttribute);
      x += point.x;
      y += point.y;
      // 当前context有rotate/scale，重置matrix
      context.setTransformForCurrent();
    }

    if (drawPathProxy(area, context, x, y, drawContext, params)) {
      context.highPerformanceRestore();
      return;
    }

    this.drawShape(area, context, x, y, drawContext, params);

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
    cache: IAreaCacheItem,
    fill: boolean,
    fillOpacity: number,
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
    context.beginPath();

    const ret: boolean = false;
    drawAreaSegments(context.camera ? context : context.nativeContext, cache, clipRange, {
      offsetX,
      offsetY,
      offsetZ
    });

    if (!this._areaRenderContribitions) {
      this._areaRenderContribitions = this.areaRenderContribitions.getContributions() || [];
      this._areaRenderContribitions.sort((a, b) => b.order - a.order);
    }
    this._areaRenderContribitions.forEach(c => {
      if (c.time === BaseRenderContributionTime.beforeFillStroke) {
        // c.useStyle && context.setCommonStyle(arc, arc.attribute, x, y, arcAttribute);
        c.drawShape(
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
      }
    });

    // shadow
    context.setShadowStyle && context.setShadowStyle(area, attribute, defaultAttribute);

    const { x: originX = 0, x: originY = 0 } = attribute;
    if (fill !== false) {
      if (fillCb) {
        fillCb(context, attribute, defaultAttribute);
      } else if (fillOpacity) {
        context.setCommonStyle(area, attribute, originX - offsetX, originY - offsetY, defaultAttribute);
        context.fill();
      }
    }

    if (!this._areaRenderContribitions) {
      this._areaRenderContribitions = this.areaRenderContribitions.getContributions() || [];
    }
    this._areaRenderContribitions.forEach(c => {
      if (c.time === BaseRenderContributionTime.afterFillStroke) {
        c.drawShape(
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
      }
    });

    return ret;
  }
}
