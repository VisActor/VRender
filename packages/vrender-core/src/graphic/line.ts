import type { AABBBounds, OBBBounds, IPointLike } from '@visactor/vutils';
import type { ILine, ILineGraphicAttribute } from '../interface';
import { Graphic, GRAPHIC_UPDATE_TAG_KEY, NOWORK_ANIMATE_ATTR } from './graphic';
import { getTheme } from './theme';
import { application } from '../application';
import { parsePadding, pointsInterpolation } from '../common/utils';
import { CustomPath2D } from '../common/custom-path2d';
import { LINE_NUMBER_TYPE } from './constants';

const LINE_UPDATE_TAG_KEY = ['segments', 'points', 'curveType', ...GRAPHIC_UPDATE_TAG_KEY];

export class Line extends Graphic<ILineGraphicAttribute> implements ILine {
  type: 'line' = 'line';

  constructor(params: ILineGraphicAttribute = {}) {
    super(params);
    this.numberType = LINE_NUMBER_TYPE;
  }

  static NOWORK_ANIMATE_ATTR = {
    segments: 1,
    curveType: 1,
    ...NOWORK_ANIMATE_ATTR
  };

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
      if (points.length <= 1) {
        return false;
      }
      return true;
    }
    return false;
  }

  protected _interpolate(key: string, ratio: number, lastStepVal: any, nextStepVal: any, nextAttributes: any): void {
    if (key === 'points') {
      (nextAttributes as any).points = pointsInterpolation(lastStepVal, nextStepVal, ratio);
    }
  }

  protected doUpdateAABBBounds(): AABBBounds {
    const lineTheme = getTheme(this).line;
    this._AABBBounds.setValue(Infinity, Infinity, -Infinity, -Infinity);
    const attribute = this.attribute;
    const bounds = application.graphicService.updateLineAABBBounds(
      attribute,
      getTheme(this).line,
      this._AABBBounds,
      this
    ) as AABBBounds;

    const { boundsPadding = lineTheme.boundsPadding } = attribute;
    const paddingArray = parsePadding(boundsPadding);
    if (paddingArray) {
      bounds.expand(paddingArray);
    }

    this.clearUpdateBoundTag();
    return bounds;
  }

  protected tryUpdateOBBBounds(): OBBBounds {
    throw new Error('暂不支持');
  }

  getDefaultAttribute(name: string) {
    const lineTheme = getTheme(this).line;
    return lineTheme[name];
  }

  protected needUpdateTags(keys: string[]): boolean {
    return super.needUpdateTags(keys, LINE_UPDATE_TAG_KEY);
  }
  protected needUpdateTag(key: string): boolean {
    return super.needUpdateTag(key, LINE_UPDATE_TAG_KEY);
  }

  toCustomPath() {
    const attribute = this.attribute;
    const path = new CustomPath2D();
    const segments = attribute.segments;

    const parsePoints = (points: IPointLike[]) => {
      if (points && points.length) {
        let isFirst = true;
        points.forEach(point => {
          if (point.defined === false) {
            return;
          }
          if (isFirst) {
            path.moveTo(point.x, point.y);
          } else {
            path.lineTo(point.x, point.y);
          }

          isFirst = false;
        });
      }
    };

    if (segments && segments.length) {
      segments.forEach(seg => {
        parsePoints(seg.points);
      });
    } else if (attribute.points) {
      parsePoints(attribute.points);
    }

    return path;
  }

  clone() {
    return new Line({ ...this.attribute });
  }

  getNoWorkAnimateAttr(): Record<string, number> {
    return Line.NOWORK_ANIMATE_ATTR;
  }
}

export function createLine(attributes: ILineGraphicAttribute): ILine {
  return new Line(attributes);
}

// addAttributeToPrototype(DefaultLineStyle, Line, PURE_STYLE_KEY);
