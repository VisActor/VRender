import type { AABBBounds, OBBBounds } from '@visactor/vutils';
import { Graphic, GRAPHIC_UPDATE_TAG_KEY, NOWORK_ANIMATE_ATTR } from './graphic';
import type { GraphicType, ICustomPath2D, IRect, IRectGraphicAttribute } from '../interface';
import { CustomPath2D } from '../common/custom-path2d';
import { parsePadding } from '../common/utils';
import { getTheme } from './theme';
import { application } from '../application';
import { RECT_NUMBER_TYPE } from './constants';

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

  protected doUpdateAABBBounds(): AABBBounds {
    const rectTheme = getTheme(this).rect;
    this._AABBBounds.setValue(Infinity, Infinity, -Infinity, -Infinity);
    const attribute = this.attribute;
    const bounds = application.graphicService.updateRectAABBBounds(
      attribute,
      getTheme(this).rect,
      this._AABBBounds,
      this
    ) as AABBBounds;

    const { boundsPadding = rectTheme.boundsPadding } = attribute;
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
    const rectTheme = getTheme(this).rect;
    return rectTheme[name];
  }

  protected needUpdateTags(keys: string[]): boolean {
    return super.needUpdateTags(keys, RECT_UPDATE_TAG_KEY);
  }
  protected needUpdateTag(key: string): boolean {
    return super.needUpdateTag(key, RECT_UPDATE_TAG_KEY);
  }

  toCustomPath(): ICustomPath2D {
    throw new Error('暂不支持');
    // const attribute = this.attribute;
    // const width = attribute.width;
    // const height = attribute.height;
    // const x = 0;
    // const y = 0;

    // const path = new CustomPath2D();
    // path.moveTo(x, y);
    // path.rect(x, y, width, height);

    // return path;
  }

  clone() {
    return new Rect({ ...this.attribute });
  }

  getNoWorkAnimateAttr(): Record<string, number> {
    return Rect.NOWORK_ANIMATE_ATTR;
  }
}
