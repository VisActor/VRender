import type { AABBBounds, OBBBounds } from '@visactor/vutils';
import { Graphic, GRAPHIC_UPDATE_TAG_KEY } from './graphic';
import type { IPolygon, IPolygonGraphicAttribute } from '../interface/graphic/polygon';
import { getTheme } from './theme';
import { parsePadding, pointsInterpolation } from '../common/utils';
import { CustomPath2D } from '../common/custom-path2d';
import { application } from '../application';
import type { GraphicType } from '../interface';
import { POLYGON_NUMBER_TYPE } from './constants';

const POLYGON_UPDATE_TAG_KEY = ['points', 'cornerRadius', ...GRAPHIC_UPDATE_TAG_KEY];

export class Polygon extends Graphic<IPolygonGraphicAttribute> implements IPolygon {
  type: GraphicType = 'polygon';

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

  protected doUpdateAABBBounds(): AABBBounds {
    const polygonTheme = getTheme(this).polygon;
    this._AABBBounds.setValue(Infinity, Infinity, -Infinity, -Infinity);

    const attribute = this.attribute;
    const bounds = application.graphicService.updatePolygonAABBBounds(
      attribute,
      getTheme(this).polygon,
      this._AABBBounds,
      this
    ) as AABBBounds;

    const { boundsPadding = polygonTheme.boundsPadding } = attribute;
    const paddingArray = parsePadding(boundsPadding);
    if (paddingArray) {
      bounds.expand(paddingArray);
    }

    this.clearUpdateBoundTag();

    return this._AABBBounds;
  }

  protected tryUpdateOBBBounds(): OBBBounds {
    throw new Error('暂不支持');
  }

  protected _interpolate(key: string, ratio: number, lastStepVal: any, nextStepVal: any, nextAttributes: any): void {
    if (key === 'points') {
      (nextAttributes as any).points = pointsInterpolation(lastStepVal, nextStepVal, ratio);
    }
  }

  getDefaultAttribute(name: string) {
    const polygonTheme = getTheme(this).polygon;
    return polygonTheme[name];
  }

  needUpdateTags(keys: string[]): boolean {
    for (let i = 0; i < POLYGON_UPDATE_TAG_KEY.length; i++) {
      const attrKey = POLYGON_UPDATE_TAG_KEY[i];
      if (keys.indexOf(attrKey) !== -1) {
        return true;
      }
    }
    return false;
  }
  needUpdateTag(key: string): boolean {
    for (let i = 0; i < POLYGON_UPDATE_TAG_KEY.length; i++) {
      const attrKey = POLYGON_UPDATE_TAG_KEY[i];
      if (key === attrKey) {
        return true;
      }
    }
    return false;
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
}
