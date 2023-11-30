import type { AABBBounds, OBBBounds, IPointLike } from '@visactor/vutils';
import type { IArea, IAreaCacheItem, IAreaGraphicAttribute } from '../interface';
import { Graphic, GRAPHIC_UPDATE_TAG_KEY, NOWORK_ANIMATE_ATTR } from './graphic';
import { CustomPath2D } from '../common/custom-path2d';
import { parsePadding, pointsInterpolation } from '../common/utils';
import { getTheme } from './theme';
import { application } from '../application';
import { AREA_NUMBER_TYPE } from './constants';

const AREA_UPDATE_TAG_KEY = ['segments', 'points', 'curveType', ...GRAPHIC_UPDATE_TAG_KEY];

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

  protected doUpdateAABBBounds(): AABBBounds {
    const areaTheme = getTheme(this).area;
    this._AABBBounds.setValue(Infinity, Infinity, -Infinity, -Infinity);

    const attribute = this.attribute;
    const bounds = application.graphicService.updateAreaAABBBounds(
      attribute,
      getTheme(this).area,
      this._AABBBounds,
      this
    ) as AABBBounds;

    const { boundsPadding = areaTheme.boundsPadding } = attribute;
    const paddingArray = parsePadding(boundsPadding);
    if (paddingArray) {
      bounds.expand(paddingArray);
    }

    this.clearUpdateBoundTag();
    return bounds;
  }
  // private tryUpdateAABBBoundsByPoints(): AABBBounds {
  //   const areaTheme = getTheme(this).area;
  //   const { points = areaTheme.points } = this.attribute;
  //   const b = this._AABBBounds;
  //   points.forEach(p => {
  //     b.add(p.x, p.y);
  //     b.add(p.x1 ?? p.x, p.y1 ?? p.y); //面积图特殊性：由三个值构成，横向面积图，x1会省略；纵向面积图，y1会省略
  //   });
  //   const {
  //     x = areaTheme.x,
  //     y = areaTheme.y,
  //     dx = areaTheme.dx,
  //     dy = areaTheme.dy,
  //     scaleX = areaTheme.scaleX,
  //     scaleY = areaTheme.scaleY,
  //     angle = areaTheme.angle
  //   } = this.attribute;
  //   // 合并shadowRoot的bounds
  //   this.combindShadowAABBBounds(this._AABBBounds);
  //   // TODO 加上锚点
  //   transformBounds(b, x, y, scaleX, scaleY, angle);
  //   this._AABBBounds.translate(dx, dy);
  //   return b;
  // }
  // private tryUpdateAABBBoundsBySegments(): AABBBounds {
  //   const areaTheme = getTheme(this).area;
  //   const { segments = areaTheme.segments } = this.attribute;
  //   const b = this._AABBBounds;
  //   segments.forEach(s => {
  //     s.points.forEach(p => {
  //       b.add(p.x, p.y);
  //       b.add(p.x1 ?? p.x, p.y1 ?? p.y); //面积图特殊性：由三个值构成，横向面积图，x1会省略；纵向面积图，y1会省略
  //     });
  //   });
  //   const {
  //     x = areaTheme.x,
  //     y = areaTheme.y,
  //     dx = areaTheme.dx,
  //     dy = areaTheme.dy,
  //     scaleX = areaTheme.scaleX,
  //     scaleY = areaTheme.scaleY,
  //     angle = areaTheme.angle
  //   } = this.attribute;
  //   // 合并shadowRoot的bounds
  //   this.combindShadowAABBBounds(this._AABBBounds);
  //   // TODO 加上锚点
  //   transformBounds(b, x, y, scaleX, scaleY, angle);
  //   this._AABBBounds.translate(dx, dy);
  //   return b;
  // }

  protected tryUpdateOBBBounds(): OBBBounds {
    throw new Error('暂不支持');
  }

  protected _interpolate(key: string, ratio: number, lastStepVal: any, nextStepVal: any, nextAttributes: any): void {
    if (key === 'points') {
      (nextAttributes as any).points = pointsInterpolation(lastStepVal, nextStepVal, ratio);
    }
  }

  getDefaultAttribute(name: string) {
    const areaTheme = getTheme(this).area;
    return areaTheme[name];
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
