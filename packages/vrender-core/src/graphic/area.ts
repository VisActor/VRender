import type { IAABBBounds, IPointLike } from '@visactor/vutils';
import type { IArea, IAreaCacheItem, IAreaGraphicAttribute } from '../interface';
import { Graphic, GRAPHIC_UPDATE_TAG_KEY, NOWORK_ANIMATE_ATTR } from './graphic';
import { CustomPath2D } from '../common/custom-path2d';
import { pointsInterpolation } from '../common/utils';
import { getTheme } from './theme';
import { application } from '../application';
import { AREA_NUMBER_TYPE } from './constants';

const AREA_UPDATE_TAG_KEY = ['segments', 'points', 'curveType', 'curveTension', ...GRAPHIC_UPDATE_TAG_KEY];

export class Area extends Graphic<IAreaGraphicAttribute> implements IArea {
  type: 'area' = 'area';

  static NOWORK_ANIMATE_ATTR = {
    segments: 1,
    curveType: 1,
    ...NOWORK_ANIMATE_ATTR
  };

  cache?: IAreaCacheItem;

  constructor(params: IAreaGraphicAttribute) {
    super(params);
    this.numberType = AREA_NUMBER_TYPE;
  }

  isValid(): boolean {
    return super.isValid() && this._isValid();
  }
  private _isValid(): boolean {
    if (this.pathProxy) {
      return true;
    }
    const { points, segments } = this.attribute;
    if (segments) {
      if (segments.length === 0) {
        return false;
      }
      return true;
    } else if (points) {
      if (points.length === 0) {
        return false;
      }
      return true;
    }
    return false;
  }

  getGraphicTheme(): Required<IAreaGraphicAttribute> {
    return getTheme(this).area;
  }

  protected updateAABBBounds(
    attribute: IAreaGraphicAttribute,
    areaTheme: Required<IAreaGraphicAttribute>,
    aabbBounds: IAABBBounds
  ) {
    if (!this.updatePathProxyAABBBounds(aabbBounds)) {
      attribute.segments
        ? this.updateAreaAABBBoundsBySegments(attribute, areaTheme, aabbBounds)
        : this.updateAreaAABBBoundsByPoints(attribute, areaTheme, aabbBounds);
    }
    application.graphicService.updateTempAABBBounds(aabbBounds);
    // if (!this._rectBoundsContribitions) {
    //   this._rectBoundsContribitions = this.rectBoundsContribitions.getContributions() || [];
    // }
    // this._rectBoundsContribitions.length &&
    //   this._rectBoundsContribitions.forEach(c => {
    //     c.updateBounds(attribute, areaTheme, tb1, graphic);
    //     aabbBounds.union(tb1);
    //     tb1.setValue(tb2.x1, tb2.y1, tb2.x2, tb2.y2);
    //   });

    const { lineJoin = areaTheme.lineJoin } = attribute;
    application.graphicService.transformAABBBounds(attribute, aabbBounds, areaTheme, lineJoin === 'miter', this);
    return aabbBounds;
  }

  protected updateAreaAABBBoundsByPoints(
    attribute: IAreaGraphicAttribute,
    areaTheme: Required<IAreaGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IArea
  ): IAABBBounds {
    const { points = areaTheme.points } = attribute;
    const b = aabbBounds;
    points.forEach(p => {
      b.add(p.x, p.y);
      b.add(p.x1 ?? p.x, p.y1 ?? p.y); //面积图特殊性：由三个值构成，横向面积图，x1会省略；纵向面积图，y1会省略
    });
    return b;
  }
  protected updateAreaAABBBoundsBySegments(
    attribute: IAreaGraphicAttribute,
    areaTheme: Required<IAreaGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IArea
  ): IAABBBounds {
    const { segments = areaTheme.segments } = attribute;
    const b = aabbBounds;
    segments.forEach(s => {
      s.points.forEach(p => {
        b.add(p.x, p.y);
        b.add(p.x1 ?? p.x, p.y1 ?? p.y); //面积图特殊性：由三个值构成，横向面积图，x1会省略；纵向面积图，y1会省略
      });
    });
    return b;
  }

  protected _interpolate(key: string, ratio: number, lastStepVal: any, nextStepVal: any, nextAttributes: any): void {
    if (key === 'points') {
      (nextAttributes as any).points = pointsInterpolation(lastStepVal, nextStepVal, ratio);
    }
  }

  protected needUpdateTags(keys: string[]): boolean {
    return super.needUpdateTags(keys, AREA_UPDATE_TAG_KEY);
  }
  protected needUpdateTag(key: string): boolean {
    return super.needUpdateTag(key, AREA_UPDATE_TAG_KEY);
  }

  toCustomPath() {
    const path = new CustomPath2D();
    const attribute = this.attribute;
    const segments = attribute.segments;

    const parsePoints = (points: IPointLike[]) => {
      if (points && points.length) {
        let isFirst = true;
        const basePoints: IPointLike[] = [];
        points.forEach(point => {
          if (point.defined === false) {
            return;
          }
          if (isFirst) {
            path.moveTo(point.x, point.y);
          } else {
            path.lineTo(point.x, point.y);
          }
          basePoints.push({ x: point.x1 ?? point.x, y: point.y1 ?? point.y });

          isFirst = false;
        });

        if (basePoints.length) {
          for (let i = basePoints.length - 1; i >= 0; i--) {
            path.lineTo(basePoints[i].x, basePoints[i].y);
          }

          path.closePath();
        }
      }
    };

    if (attribute.points) {
      parsePoints(attribute.points);
    } else if (segments && segments.length) {
      segments.forEach(seg => {
        parsePoints(seg.points);
      });
    }

    return path;
  }

  clone() {
    return new Area({ ...this.attribute });
  }

  getNoWorkAnimateAttr(): Record<string, number> {
    return Area.NOWORK_ANIMATE_ATTR;
  }
}

export function createArea(attributes: IAreaGraphicAttribute): IArea {
  return new Area(attributes);
}
