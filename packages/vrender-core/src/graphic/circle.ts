import { epsilon, pi2, type IAABBBounds } from '@visactor/vutils';
import type { ICircle, ICircleGraphicAttribute } from '../interface/graphic/circle';
import { Graphic, GRAPHIC_UPDATE_TAG_KEY, NOWORK_ANIMATE_ATTR } from './graphic';
import { CustomPath2D } from '../common/custom-path2d';
import { circleBounds } from '../common/utils';
import { getTheme } from './theme';
import { application } from '../application';
import { CIRCLE_NUMBER_TYPE } from './constants';
import { updateBoundsOfCommonOuterBorder } from './graphic-service/common-outer-boder-bounds';

const CIRCLE_UPDATE_TAG_KEY = ['radius', 'startAngle', 'endAngle', ...GRAPHIC_UPDATE_TAG_KEY];

/**
 * 圆形图元
 * 默认顺时针绘制
 */
export class Circle extends Graphic<ICircleGraphicAttribute> implements ICircle {
  type: 'circle' = 'circle';

  static NOWORK_ANIMATE_ATTR = NOWORK_ANIMATE_ATTR;

  constructor(params: ICircleGraphicAttribute = { radius: 1 }) {
    super(params);
    this.numberType = CIRCLE_NUMBER_TYPE;
  }

  isValid(): boolean {
    return super.isValid() && this._isValid();
  }
  private _isValid(): boolean {
    const { startAngle, endAngle, radius } = this.attribute;
    return this._validNumber(startAngle) && this._validNumber(endAngle) && this._validNumber(radius);
  }

  getGraphicTheme(): Required<ICircleGraphicAttribute> {
    return getTheme(this).circle;
  }

  protected updateAABBBounds(
    attribute: ICircleGraphicAttribute,
    circleTheme: Required<ICircleGraphicAttribute>,
    aabbBounds: IAABBBounds,
    full?: boolean
  ) {
    if (!this.updatePathProxyAABBBounds(aabbBounds)) {
      full
        ? this.updateCircleAABBBoundsImprecise(attribute, circleTheme, aabbBounds)
        : this.updateCircleAABBBoundsAccurate(attribute, circleTheme, aabbBounds);
    }

    const { tb1, tb2 } = application.graphicService.updateTempAABBBounds(aabbBounds);

    updateBoundsOfCommonOuterBorder(attribute, circleTheme, tb1);
    aabbBounds.union(tb1);
    tb1.setValue(tb2.x1, tb2.y1, tb2.x2, tb2.y2);

    application.graphicService.transformAABBBounds(attribute, aabbBounds, circleTheme, false, this);

    return aabbBounds;
  }

  protected updateCircleAABBBoundsImprecise(
    attribute: ICircleGraphicAttribute,
    circleTheme: Required<ICircleGraphicAttribute>,
    aabbBounds: IAABBBounds
  ): IAABBBounds {
    const { radius = circleTheme.radius } = attribute;
    aabbBounds.set(-radius, -radius, radius, radius);

    return aabbBounds;
  }
  protected updateCircleAABBBoundsAccurate(
    attribute: ICircleGraphicAttribute,
    circleTheme: Required<ICircleGraphicAttribute>,
    aabbBounds: IAABBBounds
  ): IAABBBounds {
    const {
      startAngle = circleTheme.startAngle,
      endAngle = circleTheme.endAngle,
      radius = circleTheme.radius
    } = attribute;

    if (endAngle - startAngle > pi2 - epsilon) {
      aabbBounds.set(-radius, -radius, radius, radius);
    } else {
      circleBounds(startAngle, endAngle, radius, aabbBounds);
    }

    return aabbBounds;
  }

  protected needUpdateTags(keys: string[]): boolean {
    return super.needUpdateTags(keys, CIRCLE_UPDATE_TAG_KEY);
  }
  protected needUpdateTag(key: string): boolean {
    return super.needUpdateTag(key, CIRCLE_UPDATE_TAG_KEY);
  }

  toCustomPath() {
    const x = 0;
    const y = 0;

    const attribute = this.attribute;
    const radius = attribute.radius ?? this.getDefaultAttribute('radius');
    const startAngle = attribute.startAngle ?? this.getDefaultAttribute('startAngle');
    const endAngle = attribute.endAngle ?? this.getDefaultAttribute('endAngle');

    const path = new CustomPath2D();

    path.arc(x, y, radius, startAngle, endAngle);

    return path;
  }

  clone() {
    return new Circle({ ...this.attribute });
  }

  getNoWorkAnimateAttr(): Record<string, number> {
    return Circle.NOWORK_ANIMATE_ATTR;
  }
}

export function createCircle(attributes: ICircleGraphicAttribute): ICircle {
  return new Circle(attributes);
}

// addAttributeToPrototype(DefaultCircleStyle, Circle, PURE_STYLE_KEY);
