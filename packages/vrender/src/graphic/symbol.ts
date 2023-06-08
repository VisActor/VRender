import { AABBBounds, OBBBounds, isArray, max } from '@visactor/vutils';
import { ISymbol, ISymbolGraphicAttribute } from '../interface';
import { builtinSymbolsMap, CustomSymbolClass } from './builtin-symbol';
import { Graphic, GRAPHIC_UPDATE_TAG_KEY, genNumberType } from './graphic';
import { ISymbolClass } from './builtin-symbol/interface';
import { parsePadding } from '../common/utils';
import { getTheme } from './theme';
import { graphicService } from '../modules';
import { CustomPath2D } from '../common/custom-path2d';

export const SYMBOL_NUMBER_TYPE = genNumberType();

const SYMBOL_UPDATE_TAG_KEY = ['symbolType', 'size', ...GRAPHIC_UPDATE_TAG_KEY];

/**
 * symbol
 */
export class Symbol extends Graphic<ISymbolGraphicAttribute> implements ISymbol {
  type: 'symbol' = 'symbol';

  static userSymbolMap: Record<string, ISymbolClass> = {};

  constructor(params: ISymbolGraphicAttribute = { symbolType: 'circle' }) {
    super(params);
    this.numberType = SYMBOL_NUMBER_TYPE;
  }

  protected _parsedPath?: ISymbolClass;

  getParsedPath(): ISymbolClass {
    if (this.shouldUpdateShape()) {
      this.doUpdateParsedPath();
      this.clearUpdateShapeTag();
    }
    return this._parsedPath as ISymbolClass;
  }

  isValid(): boolean {
    return super.isValid() && this._isValid();
  }
  private _isValid(): boolean {
    const { size } = this.attribute;
    return isArray(size) ? size.length === 2 && size.every(this._validNumber) : this._validNumber(size);
  }

  protected doUpdateParsedPath(): ISymbolClass {
    const symbolTheme = getTheme(this).symbol;
    // 查找内置symbol
    const { symbolType = symbolTheme.symbolType } = this.attribute;
    let path = builtinSymbolsMap[symbolType];
    if (path) {
      this._parsedPath = path;
      return path;
    }
    path = Symbol.userSymbolMap[symbolType];
    if (path) {
      this._parsedPath = path;
      return path;
    }
    const cache = new CustomPath2D().fromString(symbolType);
    const width = cache.bounds.width();
    const height = cache.bounds.height();
    // 规范化到1
    const maxWH = max(width, height);
    const scale = 1 / maxWH;
    cache.transform(0, 0, scale, scale);
    this._parsedPath = new CustomSymbolClass(symbolType, cache);
    Symbol.userSymbolMap[symbolType] = this._parsedPath;
    return this._parsedPath;
  }

  protected doUpdateAABBBounds(full?: boolean): AABBBounds {
    const symbolTheme = getTheme(this).symbol;
    this._AABBBounds.setValue(Infinity, Infinity, -Infinity, -Infinity);
    const attribute = this.attribute;
    const bounds = graphicService.updateSymbolAABBBounds(
      attribute,
      getTheme(this).symbol,
      this._AABBBounds,
      full,
      this
    );

    const { boundsPadding = symbolTheme.boundsPadding } = attribute;
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
    const symbolTheme = getTheme(this).symbol;
    return symbolTheme[name];
  }

  needUpdateTags(keys: string[]): boolean {
    for (let i = 0; i < SYMBOL_UPDATE_TAG_KEY.length; i++) {
      const attrKey = SYMBOL_UPDATE_TAG_KEY[i];
      if (keys.indexOf(attrKey) !== -1) {
        return true;
      }
    }
    return false;
  }
  needUpdateTag(key: string): boolean {
    for (let i = 0; i < SYMBOL_UPDATE_TAG_KEY.length; i++) {
      const attrKey = SYMBOL_UPDATE_TAG_KEY[i];
      if (key === attrKey) {
        return true;
      }
    }
    return false;
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
}

// addAttributeToPrototype(DefaultSymbolStyle, Symbol, PURE_STYLE_KEY);
