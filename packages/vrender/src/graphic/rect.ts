import { AABBBounds, OBBBounds } from '@visactor/vutils';
import { Graphic, GRAPHIC_UPDATE_TAG_KEY } from './graphic';
import { GraphicType, IRect, IRectGraphicAttribute } from '../interface';
import { CustomPath2D } from '../common/custom-path2d';
import { parsePadding } from '../common/utils';
import { getTheme } from './theme';
import { graphicService } from '../modules';
import { RECT_NUMBER_TYPE } from './constants';

const RECT_UPDATE_TAG_KEY = ['width', 'height', 'borderRadius', ...GRAPHIC_UPDATE_TAG_KEY];

export class Rect extends Graphic<IRectGraphicAttribute> implements IRect {
  type: GraphicType = 'rect';

  constructor(params: IRectGraphicAttribute) {
    super(params);
    this.numberType = RECT_NUMBER_TYPE;
  }

  isValid(): boolean {
    return super.isValid() && this._isValid();
  }
  private _isValid(): boolean {
    const { width, height } = this.attribute;
    return this._validNumber(width) && this._validNumber(height);
  }

  protected doUpdateAABBBounds(): AABBBounds {
    const rectTheme = getTheme(this).rect;
    this._AABBBounds.setValue(Infinity, Infinity, -Infinity, -Infinity);
    const attribute = this.attribute;
    const bounds = graphicService.updateRectAABBBounds(
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

  needUpdateTags(keys: string[]): boolean {
    for (let i = 0; i < RECT_UPDATE_TAG_KEY.length; i++) {
      const attrKey = RECT_UPDATE_TAG_KEY[i];
      if (keys.indexOf(attrKey) !== -1) {
        return true;
      }
    }
    return false;
  }
  needUpdateTag(key: string): boolean {
    for (let i = 0; i < RECT_UPDATE_TAG_KEY.length; i++) {
      const attrKey = RECT_UPDATE_TAG_KEY[i];
      if (key === attrKey) {
        return true;
      }
    }
    return false;
  }

  toCustomPath() {
    const attribute = this.attribute;
    const width = attribute.width;
    const height = attribute.height;
    const x = 0;
    const y = 0;

    const path = new CustomPath2D();
    path.moveTo(x, y);
    path.rect(x, y, width, height);

    return path;
  }

  clone() {
    return new Rect({ ...this.attribute });
  }
}
