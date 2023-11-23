import type { OBBBounds } from '@visactor/vutils';
import { AABBBounds } from '@visactor/vutils';
import { isArray, max } from '@visactor/vutils';
import type { ISymbol, ISymbolClass, ISymbolGraphicAttribute } from '../interface';
import { builtinSymbolsMap, builtInSymbolStrMap, CustomSymbolClass } from './builtin-symbol';
import { Graphic, GRAPHIC_UPDATE_TAG_KEY, NOWORK_ANIMATE_ATTR } from './graphic';
import { parsePadding } from '../common/utils';
import { getTheme } from './theme';
import { application } from '../application';
import { CustomPath2D } from '../common/custom-path2d';
import { SVG_PARSE_ATTRIBUTE_MAP, SVG_PARSE_ATTRIBUTE_MAP_KEYS, SYMBOL_NUMBER_TYPE } from './constants';
import { XMLParser } from '../common/xml';
import { isSvg } from '../common/xml/parser';

const _tempBounds = new AABBBounds();

const SYMBOL_UPDATE_TAG_KEY = ['symbolType', 'size', ...GRAPHIC_UPDATE_TAG_KEY];

/**
 * symbol
 */
export class Symbol extends Graphic<ISymbolGraphicAttribute> implements ISymbol {
  type: 'symbol' = 'symbol';

  static userSymbolMap: Record<string, ISymbolClass> = {};

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
    let { symbolType = symbolTheme.symbolType } = this.attribute;
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

    const _symbolType = builtInSymbolStrMap[symbolType];
    symbolType = _symbolType || symbolType;
    // 判断是否是svg
    const valid = isSvg(symbolType);
    if (valid === true) {
      const parser = new XMLParser();
      const { svg } = parser.parse(symbolType);
      if (!svg) {
        return null;
      }
      const path = isArray(svg.path) ? svg.path : [svg.path];
      _tempBounds.clear();
      const cacheList: { path: CustomPath2D; attribute: Record<string, any> }[] = [];
      path.forEach((item: any) => {
        const cache = new CustomPath2D().fromString(item.d);
        const attribute: any = {};
        SVG_PARSE_ATTRIBUTE_MAP_KEYS.forEach(k => {
          if (item[k]) {
            attribute[SVG_PARSE_ATTRIBUTE_MAP[k]] = item[k];
          }
        });
        // 查找
        cacheList.push({
          path: cache,
          attribute
        });
        _tempBounds.union(cache.bounds);
      });
      const width = _tempBounds.width();
      const height = _tempBounds.height();
      // 规范化到1
      const maxWH = max(width, height);
      const scale = 1 / maxWH;
      cacheList.forEach(cache => cache.path.transform(0, 0, scale, scale));

      this._parsedPath = new CustomSymbolClass(symbolType, cacheList, true);
      Symbol.userSymbolMap[symbolType] = this._parsedPath;
      return this._parsedPath;
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
    const bounds = application.graphicService.updateSymbolAABBBounds(
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

// addAttributeToPrototype(DefaultSymbolStyle, Symbol, PURE_STYLE_KEY);
