import type { IAABBBounds } from '@visactor/vutils';
import { isString, isNil } from '@visactor/vutils';
import { Graphic, GRAPHIC_UPDATE_TAG_KEY, NOWORK_ANIMATE_ATTR } from './graphic';
import type { ICustomPath2D, IPath, IPathGraphicAttribute } from '../interface';
import { CustomPath2D } from '../common/custom-path2d';
import { getTheme } from './theme';
import { application } from '../application';
import { PATH_NUMBER_TYPE } from './constants';
import { updateBoundsOfCommonOuterBorder } from './graphic-service/common-outer-boder-bounds';

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
    const pathTheme = this.getGraphicTheme();
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

  getGraphicTheme(): Required<IPathGraphicAttribute> {
    return getTheme(this).path;
  }

  protected updateAABBBounds(
    attribute: IPathGraphicAttribute,
    pathTheme: Required<IPathGraphicAttribute>,
    aabbBounds: IAABBBounds
  ) {
    if (!this.updatePathProxyAABBBounds(aabbBounds)) {
      const pathShape = this.getParsedPathShape();
      aabbBounds.union(pathShape.getBounds());
    }

    const { tb1, tb2 } = application.graphicService.updateTempAABBBounds(aabbBounds);

    updateBoundsOfCommonOuterBorder(attribute, pathTheme, tb1);
    aabbBounds.union(tb1);
    tb1.setValue(tb2.x1, tb2.y1, tb2.x2, tb2.y2);
    const { lineJoin = pathTheme.lineJoin } = attribute;
    application.graphicService.transformAABBBounds(attribute, aabbBounds, pathTheme, lineJoin === 'miter', this);
    return aabbBounds;
  }

  protected doUpdateAABBBounds(full?: boolean) {
    this.doUpdatePathShape();
    return super.doUpdateAABBBounds(full);
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
