import type { AABBBounds, OBBBounds } from '@visactor/vutils';
import { transformBounds } from '@visactor/vutils';
import type { ICircle, ICircleGraphicAttribute } from '../interface/graphic/circle';
import { Graphic, GRAPHIC_UPDATE_TAG_KEY } from './graphic';
import { CustomPath2D } from '../common/custom-path2d';
import { parsePadding } from '../common/utils';
import { getTheme } from './theme';
import { application } from '../application';
import { CIRCLE_NUMBER_TYPE } from './constants';

const CIRCLE_UPDATE_TAG_KEY = ['radius', 'startAngle', 'endAngle', ...GRAPHIC_UPDATE_TAG_KEY];

/**
 * 圆形图元
 * 默认顺时针绘制
 */
export class Circle extends Graphic<ICircleGraphicAttribute> implements ICircle {
  type: 'circle' = 'circle';

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

  protected doUpdateAABBBounds(full?: boolean): AABBBounds {
    const circleTheme = getTheme(this).circle;
    this._AABBBounds.setValue(Infinity, Infinity, -Infinity, -Infinity);
    const attribute = this.attribute;
    const bounds = application.graphicService.updateCircleAABBBounds(
      attribute,
      getTheme(this).circle,
      this._AABBBounds,
      full,
      this
    );

    const { boundsPadding = circleTheme.boundsPadding } = attribute;
    const paddingArray = parsePadding(boundsPadding);
    if (paddingArray) {
      (bounds as AABBBounds).expand(paddingArray);
    }

    this.clearUpdateBoundTag();
    return bounds as AABBBounds;
  }

  protected tryUpdateOBBBounds(): OBBBounds {
    throw new Error('暂不支持');
  }

  getDefaultAttribute(name: string) {
    const circleTheme = getTheme(this).circle;
    return circleTheme[name];
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
}

// addAttributeToPrototype(DefaultCircleStyle, Circle, PURE_STYLE_KEY);
