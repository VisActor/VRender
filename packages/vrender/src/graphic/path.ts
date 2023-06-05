import { isString, AABBBounds, OBBBounds, isNil } from '@visactor/vutils';
import { Graphic, GRAPHIC_UPDATE_TAG_KEY, genNumberType } from './graphic';
import { ICustomPath2D, IPath, IPathGraphicAttribute } from '../interface';
import { CustomPath2D, parsePadding } from '../common';
import { getTheme } from './theme';
import { graphicService } from '../modules';

export const PATH_NUMBER_TYPE = genNumberType();

const PATH_UPDATE_TAG_KEY = ['path', 'customPath', ...GRAPHIC_UPDATE_TAG_KEY];

export class Path extends Graphic<IPathGraphicAttribute> implements IPath {
  type: 'path' = 'path';
  cache?: ICustomPath2D;

  constructor(params: IPathGraphicAttribute) {
    super(params);
    this.numberType = PATH_NUMBER_TYPE;
  }

  get pathShape(): ICustomPath2D {
    this.tryUpdateAABBBounds();
    return this.getParsedPathShape();
  }

  isValid(): boolean {
    return super.isValid() && this._isValid();
  }
  private _isValid(): boolean {
    const { path } = this.attribute;
    return path != null && path !== '';
  }

  getParsedPathShape(): CustomPath2D {
    const pathTheme = getTheme(this).path;
    if (!this.valid) {
      return pathTheme.path as CustomPath2D;
    }
    const attribute = this.attribute;
    if (attribute.path instanceof CustomPath2D) {
      return attribute.path;
    }

    if (isNil(this.cache)) {
      this.doUpdatePathShape();
    }

    if (this.cache instanceof CustomPath2D) {
      return this.cache;
    }
    return pathTheme.path as CustomPath2D;
  }

  protected doUpdateAABBBounds(): AABBBounds {
    const pathTheme = getTheme(this).path;
    this.doUpdatePathShape();
    this._AABBBounds.setValue(Infinity, Infinity, -Infinity, -Infinity);
    const attribute = this.attribute;
    const bounds = graphicService.updatePathAABBBounds(
      attribute,
      getTheme(this).path,
      this._AABBBounds,
      this
    ) as AABBBounds;

    const { boundsPadding = pathTheme.boundsPadding } = attribute;
    const paddingArray = parsePadding(boundsPadding);
    if (paddingArray) {
      bounds.expand(paddingArray);
    }

    this.clearUpdateBoundTag();
    return bounds;
  }

  protected doUpdatePathShape() {
    const attribute = this.attribute;
    if (isString(attribute.path, true)) {
      this.cache = new CustomPath2D().fromString(attribute.path as string);
    } else if (attribute.customPath) {
      this.cache = new CustomPath2D();
      attribute.customPath(this.cache, this);
    }
  }

  protected tryUpdateOBBBounds(): OBBBounds {
    throw new Error('暂不支持');
  }

  getDefaultAttribute(name: string) {
    const pathTheme = getTheme(this).path;
    return pathTheme[name];
  }

  needUpdateTags(keys: string[]): boolean {
    for (let i = 0; i < PATH_UPDATE_TAG_KEY.length; i++) {
      const attrKey = PATH_UPDATE_TAG_KEY[i];
      if (keys.indexOf(attrKey) !== -1) {
        return true;
      }
    }
    return false;
  }
  needUpdateTag(key: string): boolean {
    for (let i = 0; i < PATH_UPDATE_TAG_KEY.length; i++) {
      const attrKey = PATH_UPDATE_TAG_KEY[i];
      if (key === attrKey) {
        return true;
      }
    }
    return false;
  }

  toCustomPath() {
    const x = 0;
    const y = 0;

    return new CustomPath2D().fromCustomPath2D(this.getParsedPathShape(), x, y);
  }

  clone() {
    return new Path({ ...this.attribute });
  }
}
