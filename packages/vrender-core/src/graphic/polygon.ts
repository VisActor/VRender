import type { IAABBBounds } from '@visactor/vutils';
import { Graphic, GRAPHIC_UPDATE_TAG_KEY, NOWORK_ANIMATE_ATTR } from './graphic';
import type { IPolygon, IPolygonGraphicAttribute } from '../interface/graphic/polygon';
import { getTheme } from './theme';
import { pointsInterpolation } from '../common/utils';
import { CustomPath2D } from '../common/custom-path2d';
import { application } from '../application';
import type { GraphicType } from '../interface';
import { POLYGON_NUMBER_TYPE } from './constants';

const POLYGON_UPDATE_TAG_KEY = ['points', 'cornerRadius', ...GRAPHIC_UPDATE_TAG_KEY];

export class Polygon extends Graphic<IPolygonGraphicAttribute> implements IPolygon {
  type: GraphicType = 'polygon';

  static NOWORK_ANIMATE_ATTR = NOWORK_ANIMATE_ATTR;

  constructor(params: IPolygonGraphicAttribute) {
    super(params);
    this.numberType = POLYGON_NUMBER_TYPE;
  }

  isValid(): boolean {
    return super.isValid() && this._isValid();
  }
  protected _isValid(): boolean {
    const { points } = this.attribute;
    return points && points.length >= 2;
  }

  getGraphicTheme(): Required<IPolygonGraphicAttribute> {
    return getTheme(this).polygon;
  }

  protected updateAABBBounds(
    attribute: IPolygonGraphicAttribute,
    polygonTheme: Required<IPolygonGraphicAttribute>,
    aabbBounds: IAABBBounds
  ) {
    if (!this.updatePathProxyAABBBounds(aabbBounds)) {
      this.updatePolygonAABBBoundsImprecise(attribute, polygonTheme, aabbBounds);
    }
    application.graphicService.updateTempAABBBounds(aabbBounds);

    const { lineJoin = polygonTheme.lineJoin } = attribute;
    application.graphicService.transformAABBBounds(attribute, aabbBounds, polygonTheme, lineJoin === 'miter', this);
    return aabbBounds;
  }

  protected updatePolygonAABBBoundsImprecise(
    attribute: IPolygonGraphicAttribute,
    polygonTheme: Required<IPolygonGraphicAttribute>,
    aabbBounds: IAABBBounds
  ): IAABBBounds {
    const { points = polygonTheme.points } = attribute;
    points.forEach(p => {
      aabbBounds.add(p.x, p.y);
    });

    return aabbBounds;
  }

  protected _interpolate(key: string, ratio: number, lastStepVal: any, nextStepVal: any, nextAttributes: any): void {
    if (key === 'points') {
      (nextAttributes as any).points = pointsInterpolation(lastStepVal, nextStepVal, ratio);
    }
  }

  protected needUpdateTags(keys: string[]): boolean {
    return super.needUpdateTags(keys, POLYGON_UPDATE_TAG_KEY);
  }
  protected needUpdateTag(key: string): boolean {
    return super.needUpdateTag(key, POLYGON_UPDATE_TAG_KEY);
  }

  toCustomPath() {
    const points = this.attribute.points;
    const path = new CustomPath2D();

    points.forEach((point, index) => {
      if (index === 0) {
        path.moveTo(point.x, point.y);
      } else {
        path.lineTo(point.x, point.y);
      }
    });
    path.closePath();

    return path;
  }

  clone() {
    return new Polygon({ ...this.attribute });
  }

  getNoWorkAnimateAttr(): Record<string, number> {
    return Polygon.NOWORK_ANIMATE_ATTR;
  }
}

export function createPolygon(attributes: IPolygonGraphicAttribute): IPolygon {
  return new Polygon(attributes);
}
