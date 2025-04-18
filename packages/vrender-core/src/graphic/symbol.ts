import type { IAABBBounds } from '@visactor/vutils';
import { isArray } from '@visactor/vutils';
import type { ISymbol, ISymbolClass, ISymbolGraphicAttribute } from '../interface';
import { Graphic, GRAPHIC_UPDATE_TAG_KEY, NOWORK_ANIMATE_ATTR } from './graphic';
import { getTheme } from './theme';
import { application } from '../application';
import { CustomPath2D } from '../common/custom-path2d';
import { SYMBOL_NUMBER_TYPE } from './constants';
import { updateBoundsOfSymbolOuterBorder } from './graphic-service/symbol-outer-border-bounds';

const SYMBOL_UPDATE_TAG_KEY = ['symbolType', 'size', ...GRAPHIC_UPDATE_TAG_KEY];

/**
 * symbol
 */
export class Symbol extends Graphic<ISymbolGraphicAttribute> implements ISymbol {
  type: 'symbol' = 'symbol';

  static NOWORK_ANIMATE_ATTR = {
    symbolType: 1,
    ...NOWORK_ANIMATE_ATTR
  };

  constructor(params: ISymbolGraphicAttribute = { symbolType: 'circle' }) {
    super(params);
    this.numberType = SYMBOL_NUMBER_TYPE;
  }

  protected _parsedPath?: ISymbolClass;

  getParsedPath(): ISymbolClass {
    if (this.shouldUpdateShape()) {
      this._parsedPath = this.doUpdateParsedPath();
      this.clearUpdateShapeTag();
    }
    return this._parsedPath as ISymbolClass;
  }

  getParsedPath2D(x = 0, y = 0, size = 1): Path2D | null {
    let path: Path2D | null = null;
    try {
      path = new Path2D();
    } catch (err) {
      return null;
    }
    const parsedPath = this.getParsedPath();
    if (!parsedPath) {
      return null;
    }
    parsedPath.draw(path, size, x, y);
  }

  isValid(): boolean {
    return super.isValid() && this._isValid();
  }
  private _isValid(): boolean {
    const { size } = this.attribute;
    return isArray(size) ? size.length === 2 && size.every(this._validNumber) : this._validNumber(size);
  }

  protected doUpdateParsedPath(): ISymbolClass {
    const { symbolType = 'circle' } = this.attribute;
    return super.parsePath(symbolType);
  }

  getGraphicTheme(): Required<ISymbolGraphicAttribute> {
    return getTheme(this).symbol;
  }

  protected updateAABBBounds(
    attribute: ISymbolGraphicAttribute,
    symbolTheme: Required<ISymbolGraphicAttribute>,
    aabbBounds: IAABBBounds,
    full?: boolean
  ) {
    if (!this.updatePathProxyAABBBounds(aabbBounds)) {
      full
        ? this.updateSymbolAABBBoundsImprecise(attribute, symbolTheme, aabbBounds)
        : this.updateSymbolAABBBoundsAccurate(attribute, symbolTheme, aabbBounds);
    }

    const { tb1, tb2 } = application.graphicService.updateTempAABBBounds(aabbBounds);

    updateBoundsOfSymbolOuterBorder(attribute, symbolTheme, tb1);
    aabbBounds.union(tb1);
    tb1.setValue(tb2.x1, tb2.y1, tb2.x2, tb2.y2);

    this.widthWithoutTransform = aabbBounds.x2 - aabbBounds.x1;
    this.heightWithoutTransform = aabbBounds.y2 - aabbBounds.y1;
    this.x1WithoutTransform = aabbBounds.x1;
    this.y1WithoutTransform = aabbBounds.y1;

    const { lineJoin = symbolTheme.lineJoin } = attribute;
    application.graphicService.transformAABBBounds(attribute, aabbBounds, symbolTheme, lineJoin === 'miter', this);
    return aabbBounds;
  }

  protected updateSymbolAABBBoundsImprecise(
    attribute: ISymbolGraphicAttribute,
    symbolTheme: Required<ISymbolGraphicAttribute>,
    aabbBounds: IAABBBounds
  ): IAABBBounds {
    // 当做正方形计算
    const { size = symbolTheme.size } = attribute;

    if (isArray(size)) {
      aabbBounds.set(-size[0] / 2, -size[1] / 2, size[0] / 2, size[1] / 2);
    } else {
      const halfWH = size / 2;

      aabbBounds.set(-halfWH, -halfWH, halfWH, halfWH);
    }

    return aabbBounds;
  }

  protected updateSymbolAABBBoundsAccurate(
    attribute: ISymbolGraphicAttribute,
    symbolTheme: Required<ISymbolGraphicAttribute>,
    aabbBounds: IAABBBounds
  ): IAABBBounds {
    const { size = symbolTheme.size } = attribute;

    const symbolClass = this.getParsedPath();
    symbolClass.bounds(size, aabbBounds);

    return aabbBounds;
  }

  protected needUpdateTags(keys: string[]): boolean {
    return super.needUpdateTags(keys, SYMBOL_UPDATE_TAG_KEY);
  }
  protected needUpdateTag(key: string): boolean {
    return super.needUpdateTag(key, SYMBOL_UPDATE_TAG_KEY);
  }

  toCustomPath() {
    const symbolInstance = this.getParsedPath();
    const size = this.attribute.size;
    const x = 0;
    const y = 0;
    const formattedSize = isArray(size) ? size : [size, size];

    return symbolInstance.path
      ? new CustomPath2D().fromCustomPath2D(symbolInstance.path, x, y, formattedSize[0], formattedSize[1])
      : new CustomPath2D().fromString(symbolInstance.pathStr, x, y, formattedSize[0], formattedSize[1]);
  }

  clone() {
    return new Symbol({ ...this.attribute });
  }

  getNoWorkAnimateAttr(): Record<string, number> {
    return Symbol.NOWORK_ANIMATE_ATTR;
  }
}

export function createSymbol(attributes: ISymbolGraphicAttribute): ISymbol {
  return new Symbol(attributes);
}

// addAttributeToPrototype(DefaultSymbolStyle, Symbol, PURE_STYLE_KEY);
