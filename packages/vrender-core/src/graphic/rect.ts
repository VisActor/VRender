import type { IAABBBounds } from '@visactor/vutils';
import { Graphic, GRAPHIC_UPDATE_TAG_KEY, NOWORK_ANIMATE_ATTR } from './graphic';
import type { GraphicType, ICustomPath2D, IRect, IRectGraphicAttribute } from '../interface';
import { CustomPath2D } from '../common/custom-path2d';
import { getTheme } from './theme';
import { application } from '../application';
import { RECT_NUMBER_TYPE } from './constants';
import { normalizeRectAttributes } from '../common/rect-utils';
import { updateBoundsOfCommonOuterBorder } from './graphic-service/common-outer-boder-bounds';

const RECT_UPDATE_TAG_KEY = ['width', 'x1', 'y1', 'height', 'cornerRadius', ...GRAPHIC_UPDATE_TAG_KEY];

export class Rect extends Graphic<IRectGraphicAttribute> implements IRect {
  type: GraphicType = 'rect';

  static NOWORK_ANIMATE_ATTR = NOWORK_ANIMATE_ATTR;

  constructor(params: IRectGraphicAttribute) {
    super(params);
    this.numberType = RECT_NUMBER_TYPE;
  }

  isValid(): boolean {
    return super.isValid() && this._isValid();
  }
  private _isValid(): boolean {
    return true;
    // 暂时不判断，理论上认为都是合法的，节省性能耗时
    // const { width, x1, y1, height } = this.attribute;
    // return (this._validNumber(width) || this._validNumber(x1)) && (this._validNumber(height) || this._validNumber(y1));
  }

  getGraphicTheme(): Required<IRectGraphicAttribute> {
    return getTheme(this).rect;
  }

  protected updateAABBBounds(
    attribute: IRectGraphicAttribute,
    rectTheme: Required<IRectGraphicAttribute>,
    aabbBounds: IAABBBounds
  ) {
    if (!this.updatePathProxyAABBBounds(aabbBounds)) {
      let { width, height } = attribute;
      const { x1, y1, x, y } = attribute;
      width = width ?? x1 - x;
      height = height ?? y1 - y;
      if (isFinite(width) || isFinite(height) || isFinite(x) || isFinite(y)) {
        aabbBounds.set(0, 0, width || 0, height || 0);
      }
    }

    const { tb1, tb2 } = application.graphicService.updateTempAABBBounds(aabbBounds);

    updateBoundsOfCommonOuterBorder(attribute, rectTheme, tb1);
    aabbBounds.union(tb1);
    tb1.setValue(tb2.x1, tb2.y1, tb2.x2, tb2.y2);

    this.widthWithoutTransform = aabbBounds.x2 - aabbBounds.x1;
    this.heightWithoutTransform = aabbBounds.y2 - aabbBounds.y1;

    application.graphicService.transformAABBBounds(attribute, aabbBounds, rectTheme, false, this);
    return aabbBounds;
  }

  protected needUpdateTags(keys: string[]): boolean {
    return super.needUpdateTags(keys, RECT_UPDATE_TAG_KEY);
  }
  protected needUpdateTag(key: string): boolean {
    return super.needUpdateTag(key, RECT_UPDATE_TAG_KEY);
  }

  protected shouldSkipStateTransitionDefaultAttribute(
    key: string,
    targetAttrs?: Partial<IRectGraphicAttribute>
  ): boolean {
    const attrs = (targetAttrs ?? this.baseAttributes ?? this.attribute) as Partial<IRectGraphicAttribute>;
    const hasValue = (attrKey: keyof IRectGraphicAttribute) => (attrs as any)[attrKey] != null;
    const isNilValue = (attrKey: keyof IRectGraphicAttribute) => (attrs as any)[attrKey] == null;

    switch (key) {
      case 'width':
        return isNilValue('width') && hasValue('x') && hasValue('x1');
      case 'height':
        return isNilValue('height') && hasValue('y') && hasValue('y1');
      case 'x1':
        return isNilValue('x1') && hasValue('x') && hasValue('width');
      case 'y1':
        return isNilValue('y1') && hasValue('y') && hasValue('height');
      default:
        return false;
    }
  }

  protected getStateTransitionDefaultAttribute(key: string, targetAttrs?: Partial<IRectGraphicAttribute>) {
    const attrs = (targetAttrs ?? this.baseAttributes ?? this.attribute) as Partial<IRectGraphicAttribute>;
    const getNumber = (attrKey: keyof IRectGraphicAttribute) => {
      const value = attrs[attrKey];
      return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
    };
    const x = getNumber('x');
    const y = getNumber('y');
    const x1 = getNumber('x1');
    const y1 = getNumber('y1');
    const width = getNumber('width');
    const height = getNumber('height');

    switch (key) {
      case 'width':
        if (width == null && x != null && x1 != null) {
          return x1 - x;
        }
        break;
      case 'height':
        if (height == null && y != null && y1 != null) {
          return y1 - y;
        }
        break;
      case 'x1':
        if (x1 == null && x != null && width != null) {
          return x + width;
        }
        break;
      case 'y1':
        if (y1 == null && y != null && height != null) {
          return y + height;
        }
        break;
    }

    return super.getStateTransitionDefaultAttribute(key, targetAttrs);
  }

  toCustomPath(): ICustomPath2D {
    // throw new Error('暂不支持');
    let path = super.toCustomPath();
    if (path) {
      return path;
    }
    const attribute = this.attribute;
    const { x, y, width, height } = normalizeRectAttributes(attribute);

    path = new CustomPath2D();
    path.moveTo(x, y);
    path.rect(x, y, width, height);

    return path;
  }

  clone() {
    return new Rect({ ...this.attribute });
  }

  getNoWorkAnimateAttr(): Record<string, number> {
    return Rect.NOWORK_ANIMATE_ATTR;
  }
}

export function createRect(attributes: IRectGraphicAttribute): IRect {
  return new Rect(attributes);
}
