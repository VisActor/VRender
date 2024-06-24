import type { AABBBounds } from '@visactor/vutils';
import { isString, isNil } from '@visactor/vutils';
import { Graphic, GRAPHIC_UPDATE_TAG_KEY, NOWORK_ANIMATE_ATTR } from './graphic';
import type { ICustomPath2D, IPath, IPathGraphicAttribute } from '../interface';
import { parsePadding } from '../common/utils';
import { CustomPath2D } from '../common/custom-path2d';
import { getTheme } from './theme';
import { application } from '../application';
import { PATH_NUMBER_TYPE } from './constants';

const PATH_UPDATE_TAG_KEY = ['path', 'customPath', ...GRAPHIC_UPDATE_TAG_KEY];

export class Path extends Graphic<IPathGraphicAttribute> implements IPath {
  type: 'path' = 'path';
  cache?: ICustomPath2D;

  static NOWORK_ANIMATE_ATTR = {
    path: 1,
    customPath: 1,
    ...NOWORK_ANIMATE_ATTR
  };

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
    this._AABBBounds.clear();
    const attribute = this.attribute;
    const bounds = application.graphicService.updatePathAABBBounds(
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
  getDefaultAttribute(name: string) {
    const pathTheme = getTheme(this).path;
    return pathTheme[name];
  }

  protected needUpdateTags(keys: string[]): boolean {
    return super.needUpdateTags(keys, PATH_UPDATE_TAG_KEY);
  }
  protected needUpdateTag(key: string): boolean {
    return super.needUpdateTag(key, PATH_UPDATE_TAG_KEY);
  }

  toCustomPath() {
    const x = 0;
    const y = 0;

    return new CustomPath2D().fromCustomPath2D(this.getParsedPathShape(), x, y);
  }

  clone() {
    return new Path({ ...this.attribute });
  }

  getNoWorkAnimateAttr(): Record<string, number> {
    return Path.NOWORK_ANIMATE_ATTR;
  }
}

export function createPath(attributes: IPathGraphicAttribute): IPath {
  return new Path(attributes);
}
