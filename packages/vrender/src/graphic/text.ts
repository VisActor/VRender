import { max, type AABBBounds, type OBBBounds } from '@visactor/vutils';
import { getContextFont, textDrawOffsetX, textLayoutOffsetY } from '../common/text';
import { CanvasTextLayout } from '../core/contributions/textMeasure/layout';
import { application } from '../application';
import type { IText, ITextCache, ITextGraphicAttribute, LayoutType } from '../interface';
import { Graphic, GRAPHIC_UPDATE_TAG_KEY } from './graphic';
import { getTheme } from './theme';
import { parsePadding } from '../common/utils';
import { TEXT_NUMBER_TYPE } from './constants';
import { TextDirection, verticalLayout } from './tools';

const TEXT_UPDATE_TAG_KEY = [
  'text',
  'maxLineWidth',
  // 'textAlign',
  // 'textBaseline',
  'fontSize',
  'fontFamily',
  'fontWeight',
  'ellipsis',
  'lineHeight',
  ...GRAPHIC_UPDATE_TAG_KEY
];

export class Text extends Graphic<ITextGraphicAttribute> implements IText {
  type: 'text' = 'text';

  cache: ITextCache;
  _font: string;

  get font(): string {
    const textTheme = getTheme(this).text;
    if (!this._font) {
      this._font = getContextFont(this.attribute, textTheme);
    }
    return this._font as string;
  }

  get clipedText(): string | undefined {
    const attribute = this.attribute;
    const textTheme = getTheme(this).text;
    if (Array.isArray(attribute.text)) {
      return undefined;
    }
    const { maxLineWidth = textTheme.maxLineWidth } = attribute;
    if (!Number.isFinite(maxLineWidth)) {
      return (attribute.text ?? textTheme.text).toString();
    }
    this.tryUpdateAABBBounds();
    return this.cache.clipedText;
  }
  get clipedWidth(): number | undefined {
    if (Array.isArray(this.attribute.text)) {
      return undefined;
    }
    this.tryUpdateAABBBounds();
    return this.cache.clipedWidth;
  }
  get cliped(): boolean | undefined {
    const textTheme = getTheme(this).text;
    const attribute = this.attribute;
    if (Array.isArray(attribute.text)) {
      return undefined;
    }
    const { maxLineWidth = textTheme.maxLineWidth } = attribute;
    if (!Number.isFinite(maxLineWidth)) {
      return false;
    }
    this.tryUpdateAABBBounds();
    return this.clipedText !== attribute.text;
  }
  get multilineLayout(): LayoutType | undefined {
    if (!Array.isArray(this.attribute.text)) {
      return undefined;
    }
    this.tryUpdateAABBBounds();
    return this.cache.layoutData;
  }

  constructor(params: ITextGraphicAttribute = { text: '', fontSize: 16 }) {
    super(params);
    this.numberType = TEXT_NUMBER_TYPE;
    this.cache = {};
  }

  isValid(): boolean {
    return super.isValid() && this._isValid();
  }
  protected _isValid(): boolean {
    const { text } = this.attribute;
    return text != null && text !== '';
  }

  protected doUpdateAABBBounds(): AABBBounds {
    const textTheme = getTheme(this).text;
    this._AABBBounds.setValue(Infinity, Infinity, -Infinity, -Infinity);
    const attribute = this.attribute;
    const bounds = application.graphicService.updateTextAABBBounds(
      attribute,
      textTheme,
      this._AABBBounds,
      this
    ) as AABBBounds;

    const { boundsPadding = textTheme.boundsPadding } = this.attribute;
    const paddingArray = parsePadding(boundsPadding);
    if (paddingArray) {
      bounds.expand(paddingArray);
    }

    this.clearUpdateBoundTag();
    return bounds;
  }

  /**
   * 计算单行文字的bounds，可以缓存长度以及截取的文字
   * @param text
   */
  updateSingallineAABBBounds(text: number | string): AABBBounds {
    const textTheme = getTheme(this).text;
    const { direction = textTheme.direction } = this.attribute;

    return direction === 'horizontal'
      ? this.updateHorizontalSinglelineAABBBounds(text)
      : this.updateVerticalSinglelineAABBBounds(text);
  }

  /**
   * 计算单行文字的bounds，可以缓存长度以及截取的文字
   * @param text
   */
  updateMultilineAABBBounds(text: (number | string)[]): AABBBounds {
    const textTheme = getTheme(this).text;
    const { direction = textTheme.direction } = this.attribute;

    return direction === 'horizontal'
      ? this.updateHorizontalMultilineAABBBounds(text)
      : this.updateVerticalMultilineAABBBounds(text);
  }

  /**
   * 计算单行文字的bounds，可以缓存长度以及截取的文字
   * @param text
   */
  updateHorizontalSinglelineAABBBounds(text: number | string): AABBBounds {
    const textTheme = getTheme(this).text;
    const textMeasure = application.graphicUtil.textMeasure;
    let width: number;
    let str: string;
    const attribute = this.attribute;
    const {
      maxLineWidth = textTheme.maxLineWidth,
      ellipsis = textTheme.ellipsis,
      textAlign = textTheme.textAlign,
      textBaseline = textTheme.textBaseline,
      fontFamily = textTheme.fontFamily,
      fontSize = textTheme.fontSize,
      fontWeight = textTheme.fontWeight,
      stroke = textTheme.stroke,
      lineWidth = textTheme.lineWidth,
      wordBreak = textTheme.wordBreak,
      ignoreBuf = textTheme.ignoreBuf
    } = attribute;
    const buf = ignoreBuf ? 0 : Math.max(2, fontSize * 0.075);
    const { lineHeight = attribute.lineHeight ?? (attribute.fontSize || textTheme.fontSize) + buf } = attribute;
    if (!this.shouldUpdateShape() && this.cache) {
      width = this.cache.clipedWidth ?? 0;
      const dx = textDrawOffsetX(textAlign, width);
      const dy = textLayoutOffsetY(textBaseline, lineHeight, fontSize);
      this._AABBBounds.set(dx, dy, dx + width, dy + lineHeight);
      if (stroke) {
        this._AABBBounds.expand(lineWidth / 2);
      }
      return this._AABBBounds;
    }

    if (Number.isFinite(maxLineWidth)) {
      if (ellipsis) {
        const strEllipsis = (ellipsis === true ? textTheme.ellipsis : ellipsis) as string;
        const data = textMeasure.clipTextWithSuffix(
          text.toString(),
          { fontSize, fontWeight, fontFamily },
          maxLineWidth,
          strEllipsis,
          false
        );
        str = data.str;
        width = data.width;
      } else {
        const data = textMeasure.clipText(text.toString(), { fontSize, fontWeight, fontFamily }, maxLineWidth, false);
        str = data.str;
        width = data.width;
      }
      this.cache.clipedText = str;
      this.cache.clipedWidth = width;
      // todo 计算原本的宽度
    } else {
      width = textMeasure.measureTextWidth(text.toString(), { fontSize, fontWeight, fontFamily });
      this.cache.clipedText = text.toString();
      this.cache.clipedWidth = width;
    }
    this.clearUpdateShapeTag();

    const dx = textDrawOffsetX(textAlign, width);
    let lh = lineHeight;
    if (application.global && application.global.isSafari()) {
      // 如果是safari，那么需要额外增加高度
      lh += fontSize * 0.2;
    }
    const dy = textLayoutOffsetY(textBaseline, lh, fontSize, buf);
    this._AABBBounds.set(dx, dy, dx + width, dy + lh);

    if (stroke) {
      this._AABBBounds.expand(lineWidth / 2);
    }

    return this._AABBBounds;
  }

  /**
   * 计算垂直布局的单行文字的bounds，可以缓存长度以及截取的文字
   * @param text
   */
  updateVerticalSinglelineAABBBounds(text: number | string): AABBBounds {
    const textTheme = getTheme(this).text;
    const textMeasure = application.graphicUtil.textMeasure;
    let width: number;
    let str: string;
    const attribute = this.attribute;
    const { ignoreBuf = textTheme.ignoreBuf } = attribute;
    const buf = ignoreBuf ? 0 : 2;
    const {
      maxLineWidth = textTheme.maxLineWidth,
      ellipsis = textTheme.ellipsis,
      textAlign = textTheme.textAlign,
      textBaseline = textTheme.textBaseline,
      fontSize = textTheme.fontSize,
      fontWeight = textTheme.fontWeight,
      fontFamily = textTheme.fontFamily,
      stroke = textTheme.stroke,
      lineHeight = attribute.lineHeight ?? (attribute.fontSize || textTheme.fontSize) + buf,
      lineWidth = textTheme.lineWidth,
      wordBreak = textTheme.wordBreak
    } = attribute;
    if (!this.shouldUpdateShape() && this.cache) {
      width = this.cache.clipedWidth;
      const dx = textDrawOffsetX(textAlign, width);
      const dy = textLayoutOffsetY(textBaseline, lineHeight, fontSize);
      this._AABBBounds.set(dy, dx, dy + lineHeight, dx + width);
      if (stroke) {
        this._AABBBounds.expand(lineWidth / 2);
      }
      return this._AABBBounds;
    }

    let verticalList: { text: string; width?: number; direction: TextDirection }[][] = [
      verticalLayout(text.toString())
    ];
    if (Number.isFinite(maxLineWidth)) {
      if (ellipsis) {
        const strEllipsis = (ellipsis === true ? textTheme.ellipsis : ellipsis) as string;
        const data = textMeasure.clipTextWithSuffixVertical(
          verticalList[0],
          { fontSize, fontWeight, fontFamily },
          maxLineWidth,
          strEllipsis,
          false
        );
        verticalList = [data.verticalList];
        width = data.width;
      } else {
        const data = textMeasure.clipTextVertical(
          verticalList[0],
          { fontSize, fontWeight, fontFamily },
          maxLineWidth,
          false
        );
        verticalList = [data.verticalList];
        width = data.width;
      }
      this.cache.verticalList = verticalList;
      this.cache.clipedWidth = width;
      // todo 计算原本的宽度
    } else {
      width = 0;
      verticalList[0].forEach(t => {
        const w =
          t.direction === TextDirection.HORIZONTAL
            ? fontSize
            : textMeasure.measureTextWidth(t.text, { fontSize, fontWeight, fontFamily });

        width += w;
        t.width = w;
      });
      this.cache.verticalList = verticalList;
      this.cache.clipedWidth = width;
    }
    this.clearUpdateShapeTag();

    const dx = textDrawOffsetX(textAlign, width);
    const dy = textLayoutOffsetY(textBaseline, lineHeight, fontSize);
    this._AABBBounds.set(dy, dx, dy + lineHeight, dx + width);

    if (stroke) {
      this._AABBBounds.expand(lineWidth / 2);
    }

    return this._AABBBounds;
  }

  /**
   * 计算多行文字的bounds，缓存每行文字的布局位置
   * @param text
   */
  updateHorizontalMultilineAABBBounds(text: (number | string)[]): AABBBounds {
    const textTheme = getTheme(this).text;
    const attribute = this.attribute;
    const {
      fontFamily = textTheme.fontFamily,
      textAlign = textTheme.textAlign,
      textBaseline = textTheme.textBaseline,
      fontSize = textTheme.fontSize,
      fontWeight = textTheme.fontWeight,
      lineHeight = attribute.lineHeight || attribute.fontSize || textTheme.fontSize,
      ellipsis = textTheme.ellipsis,
      maxLineWidth,
      stroke = textTheme.stroke,
      lineWidth = textTheme.lineWidth,
      wordBreak = textTheme.wordBreak
    } = attribute;

    if (!this.shouldUpdateShape() && this.cache?.layoutData) {
      const bbox = this.cache.layoutData.bbox;
      this._AABBBounds.set(bbox.xOffset, bbox.yOffset, bbox.xOffset + bbox.width, bbox.yOffset + bbox.height);
      if (stroke) {
        this._AABBBounds.expand(lineWidth / 2);
      }
      return this._AABBBounds;
    }
    const textMeasure = application.graphicUtil.textMeasure;
    const layoutObj = new CanvasTextLayout(fontFamily, { fontSize, fontWeight, fontFamily }, textMeasure);
    const layoutData = layoutObj.GetLayoutByLines(
      text,
      textAlign,
      textBaseline as any,
      lineHeight,
      ellipsis === true ? (textTheme.ellipsis as string) : ellipsis || undefined,
      false,
      maxLineWidth
    );
    const { bbox } = layoutData;
    this.cache.layoutData = layoutData;
    this.clearUpdateShapeTag();

    this._AABBBounds.set(bbox.xOffset, bbox.yOffset, bbox.xOffset + bbox.width, bbox.yOffset + bbox.height);

    if (stroke) {
      this._AABBBounds.expand(lineWidth / 2);
    }

    return this._AABBBounds;
  }

  /**
   * 计算垂直布局的多行文字的bounds，可以缓存长度以及截取的文字
   * @param text
   */
  updateVerticalMultilineAABBBounds(text: (number | string)[]): AABBBounds {
    const textTheme = getTheme(this).text;
    const textMeasure = application.graphicUtil.textMeasure;
    let width: number;
    const attribute = this.attribute;
    const { ignoreBuf = textTheme.ignoreBuf } = attribute;
    const buf = ignoreBuf ? 0 : 2;
    const {
      maxLineWidth = textTheme.maxLineWidth,
      ellipsis = textTheme.ellipsis,
      textAlign = textTheme.textAlign,
      textBaseline = textTheme.textBaseline,
      fontFamily = textTheme.fontFamily,
      fontSize = textTheme.fontSize,
      fontWeight = textTheme.fontWeight,
      stroke = textTheme.stroke,
      lineHeight = attribute.lineHeight ?? (attribute.fontSize || textTheme.fontSize) + buf,
      lineWidth = textTheme.lineWidth,
      wordBreak = textTheme.wordBreak
    } = attribute;
    width = 0;
    if (!this.shouldUpdateShape() && this.cache) {
      this.cache.verticalList.forEach(item => {
        const w = item.reduce((a, b) => a + b.width, 0);
        width = max(w, width);
      });
      const dx = textDrawOffsetX(textAlign, width);
      const height = this.cache.verticalList.length * lineHeight;
      const dy = textLayoutOffsetY(textBaseline, height, fontSize);
      this._AABBBounds.set(dy, dx, dy + height, dx + width);
      if (stroke) {
        this._AABBBounds.expand(lineWidth / 2);
      }
      return this._AABBBounds;
    }

    const verticalLists: { text: string; width?: number; direction: TextDirection }[][] = text.map(str => {
      return verticalLayout(str.toString());
    });
    verticalLists.forEach((verticalData, i) => {
      if (Number.isFinite(maxLineWidth)) {
        if (ellipsis) {
          const strEllipsis = (ellipsis === true ? textTheme.ellipsis : ellipsis) as string;
          const data = textMeasure.clipTextWithSuffixVertical(
            verticalData,
            { fontSize, fontWeight, fontFamily },
            maxLineWidth,
            strEllipsis,
            false
          );
          verticalLists[i] = data.verticalList;
          width = data.width;
        } else {
          const data = textMeasure.clipTextVertical(
            verticalData,
            { fontSize, fontWeight, fontFamily },
            maxLineWidth,
            false
          );
          verticalLists[i] = data.verticalList;
          width = data.width;
        }
        // this.cache.clipedWidth = width;
        // todo 计算原本的宽度
      } else {
        width = 0;
        verticalData.forEach(t => {
          const w =
            t.direction === TextDirection.HORIZONTAL
              ? fontSize
              : textMeasure.measureTextWidth(t.text, { fontSize, fontWeight, fontFamily });

          width += w;
          t.width = w;
        });
      }
    });
    this.cache.verticalList = verticalLists;
    this.clearUpdateShapeTag();

    this.cache.verticalList.forEach(item => {
      const w = item.reduce((a, b) => a + b.width, 0);
      width = max(w, width);
    });

    const dx = textDrawOffsetX(textAlign, width);
    const height = this.cache.verticalList.length * lineHeight;
    const dy = textLayoutOffsetY(textBaseline, height, fontSize);
    this._AABBBounds.set(dy, dx, dy + height, dx + width);

    if (stroke) {
      this._AABBBounds.expand(lineWidth / 2);
    }

    return this._AABBBounds;
  }

  protected tryUpdateOBBBounds(): OBBBounds {
    throw new Error('暂不支持');
  }

  getDefaultAttribute(name: string) {
    const textTheme = getTheme(this).text;
    return textTheme[name];
  }

  needUpdateTags(keys: string[]): boolean {
    for (let i = 0; i < TEXT_UPDATE_TAG_KEY.length; i++) {
      const attrKey = TEXT_UPDATE_TAG_KEY[i];
      if (keys.indexOf(attrKey) !== -1) {
        return true;
      }
    }
    return false;
  }
  needUpdateTag(key: string): boolean {
    for (let i = 0; i < TEXT_UPDATE_TAG_KEY.length; i++) {
      const attrKey = TEXT_UPDATE_TAG_KEY[i];
      if (key === attrKey) {
        return true;
      }
    }
    return false;
  }

  clone(): Text {
    return new Text({ ...this.attribute });
  }
}

// addAttributeToPrototype(DefaultLineStyle, Text, PURE_STYLE_KEY);
