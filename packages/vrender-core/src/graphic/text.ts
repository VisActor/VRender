import type { IAABBBounds, IOBBBounds } from '@visactor/vutils';
import { max, isArray, getContextFont, transformBoundsWithMatrix, rotatePoint } from '@visactor/vutils';
import { textDrawOffsetX, textLayoutOffsetY } from '../common/text';
import { CanvasTextLayout } from '../core/contributions/textMeasure/layout';
import { application } from '../application';
import type { IText, ITextCache, ITextGraphicAttribute, LayoutItemType, LayoutType } from '../interface';
import { Graphic, GRAPHIC_UPDATE_TAG_KEY, NOWORK_ANIMATE_ATTR } from './graphic';
import { getTheme } from './theme';
import { calculateLineHeight } from '../common/utils';
import { TEXT_NUMBER_TYPE } from './constants';
import { boundStroke, TextDirection, verticalLayout } from './tools';

const TEXT_UPDATE_TAG_KEY = [
  'text',
  'maxLineWidth',
  'maxWidth',
  // 多行文本要用到
  'textAlign',
  'textBaseline',
  'heightLimit',
  'lineClamp',
  'fontSize',
  'fontFamily',
  'fontWeight',
  'ellipsis',
  'lineHeight',
  'direction',
  'wordBreak',
  'heightLimit',
  'lineClamp',
  ...GRAPHIC_UPDATE_TAG_KEY
];

export class Text extends Graphic<ITextGraphicAttribute> implements IText {
  type: 'text' = 'text';

  static NOWORK_ANIMATE_ATTR = {
    ellipsis: 1,
    wordBreak: 1,
    direction: 1,
    textAlign: 1,
    textBaseline: 1,
    fontFamily: 1,
    fontWeight: 1,
    ...NOWORK_ANIMATE_ATTR
  };

  cache: ITextCache;
  _font: string;

  protected declare obbText?: Text;

  /**
   * 获取font字符串
   */
  get font(): string {
    const textTheme = this.getGraphicTheme();
    if (!this._font) {
      this._font = getContextFont(this.attribute, textTheme);
    }
    return this._font as string;
  }

  get clipedText(): string | undefined {
    const attribute = this.attribute;
    const textTheme = this.getGraphicTheme();
    const maxWidth = this.getMaxWidth(textTheme);
    if (!Number.isFinite(maxWidth)) {
      return (attribute.text ?? textTheme.text).toString();
    }
    this.tryUpdateAABBBounds();
    return this.cache.clipedText;
  }

  get clipedWidth(): number | undefined {
    this.tryUpdateAABBBounds();
    return this.cache.clipedWidth;
  }

  /**
   * 支持单行文本，横排纵排均支持
   * TODO 支持多行文本
   */
  get cliped(): boolean | undefined {
    const textTheme = this.getGraphicTheme();
    const attribute = this.attribute;
    const maxWidth = this.getMaxWidth(textTheme);
    if (!Number.isFinite(maxWidth)) {
      return false;
    }
    const { text } = this.attribute;
    this.tryUpdateAABBBounds();
    if (this.cache?.layoutData?.lines) {
      let mergedText = '';
      this.cache.layoutData.lines.forEach(item => {
        mergedText += item.str;
      });
      const originText = Array.isArray(text) ? text.join('') : text;

      return originText !== mergedText;
    }
    if (attribute.direction === 'vertical' && this.cache.verticalList && this.cache.verticalList[0]) {
      return this.cache.verticalList[0].map(item => item.text).join('') !== attribute.text.toString();
    }
    if (this.clipedText == null) {
      return false;
    }
    return this.clipedText !== attribute.text.toString();
  }

  get multilineLayout(): LayoutType | undefined {
    this.tryUpdateAABBBounds();
    return this.cache.layoutData;
  }
  /**
   * 是否是多行文本
   */
  get isMultiLine(): boolean {
    return Array.isArray(this.attribute.text) || this.attribute.whiteSpace === 'normal';
  }

  constructor(params: ITextGraphicAttribute = { text: '', fontSize: 16 }) {
    super(params);
    this.numberType = TEXT_NUMBER_TYPE;
    this.cache = {};
  }

  /**
   * 图元属性合法，且文字不为空或者null/undefined
   * @returns
   */
  isValid(): boolean {
    return super.isValid() && this._isValid();
  }

  protected _isValid(): boolean {
    const { text } = this.attribute;
    if (isArray(text)) {
      return !(text as any[]).every((t: any) => t == null || t === '');
    }
    return text != null && text !== '';
  }

  getGraphicTheme(): Required<ITextGraphicAttribute> {
    return getTheme(this).text;
  }

  protected doUpdateOBBBounds(): IOBBBounds {
    const graphicTheme = this.getGraphicTheme();
    this._OBBBounds.clear();
    const attribute = this.attribute;
    const { angle = graphicTheme.angle } = attribute;
    if (!angle) {
      const b = this.AABBBounds;
      this._OBBBounds.setValue(b.x1, b.y1, b.x2, b.y2);
      return this._OBBBounds;
    }
    if (!this.obbText) {
      this.obbText = new Text({});
    }
    this.obbText.setAttributes({ ...attribute, angle: 0 });
    const bounds1 = this.obbText.AABBBounds;
    const { x, y } = attribute;
    const boundsCenter = { x: (bounds1.x1 + bounds1.x2) / 2, y: (bounds1.y1 + bounds1.y2) / 2 };
    const center = rotatePoint(boundsCenter, angle, { x, y });
    this._OBBBounds.copy(bounds1);
    this._OBBBounds.translate(center.x - boundsCenter.x, center.y - boundsCenter.y);
    this._OBBBounds.angle = angle;
    return this._OBBBounds;
  }

  protected updateAABBBounds(
    attribute: ITextGraphicAttribute,
    textTheme: Required<ITextGraphicAttribute>,
    aabbBounds: IAABBBounds
  ) {
    const { text = textTheme.text } = this.attribute;
    if (Array.isArray(text)) {
      this.updateMultilineAABBBounds(text as (number | string)[]);
    } else {
      this.updateSingallineAABBBounds(text as number | string);
    }

    const { tb1 } = application.graphicService.updateTempAABBBounds(aabbBounds);

    const {
      scaleX = textTheme.scaleX,
      scaleY = textTheme.scaleY,
      shadowBlur = textTheme.shadowBlur,
      strokeBoundsBuffer = textTheme.strokeBoundsBuffer
    } = attribute;
    if (shadowBlur) {
      const shadowBlurHalfWidth = shadowBlur / Math.abs(scaleX + scaleY);
      boundStroke(tb1, shadowBlurHalfWidth, true, strokeBoundsBuffer);
      aabbBounds.union(tb1);
    }
    // 合并shadowRoot的bounds
    application.graphicService.combindShadowAABBBounds(aabbBounds, this);

    if (attribute.forceBoundsHeight != null || attribute.forceBoundsWidth != null) {
      application.graphicService.updateHTMLTextAABBBounds(attribute, textTheme, aabbBounds);
    }

    transformBoundsWithMatrix(aabbBounds, aabbBounds, this.transMatrix);
    return aabbBounds;
  }

  /**
   * 计算单行文字的bounds，可以缓存长度以及截取的文字
   * @param text
   */
  updateSingallineAABBBounds(text: number | string): IAABBBounds {
    this.updateMultilineAABBBounds([text]);
    const layoutData = this.cache.layoutData;
    if (layoutData && layoutData.lines && layoutData.lines.length) {
      const line = layoutData.lines[0];
      this.cache.clipedText = line.str;
      this.cache.clipedWidth = line.width;
    }
    return this._AABBBounds;
  }

  /**
   * 计算单行文字的bounds，可以缓存长度以及截取的文字
   * @param text
   */
  protected updateMultilineAABBBounds(text: (number | string)[]): IAABBBounds {
    const textTheme = this.getGraphicTheme();
    const { direction = textTheme.direction, underlineOffset = textTheme.underlineOffset } = this.attribute;

    const b =
      direction === 'horizontal'
        ? this.updateHorizontalMultilineAABBBounds(text)
        : this.updateVerticalMultilineAABBBounds(text);

    if (direction === 'horizontal') {
      if (underlineOffset) {
        this._AABBBounds.add(this._AABBBounds.x1, this._AABBBounds.y2 + underlineOffset);
      }
    }
    return b;
  }

  guessLineHeightBuf(fontSize: number) {
    return fontSize ? fontSize * 0.1 : 0;
  }

  /**
   * 计算多行文字的bounds，缓存每行文字的布局位置
   * @param text
   */
  updateHorizontalMultilineAABBBounds(text: (number | string)[]): IAABBBounds {
    const textTheme = this.getGraphicTheme();

    const attribute = this.attribute;
    const {
      fontFamily = textTheme.fontFamily,
      textAlign = textTheme.textAlign,
      textBaseline = textTheme.textBaseline,
      fontSize = textTheme.fontSize,
      fontWeight = textTheme.fontWeight,
      ellipsis = textTheme.ellipsis,
      maxLineWidth,
      stroke = textTheme.stroke,
      wrap = textTheme.wrap,
      measureMode = textTheme.measureMode,
      lineWidth = textTheme.lineWidth,
      whiteSpace = textTheme.whiteSpace,
      suffixPosition = textTheme.suffixPosition,
      ignoreBuf = textTheme.ignoreBuf,
      keepCenterInLine = textTheme.keepCenterInLine
    } = attribute;

    const buf = ignoreBuf ? 0 : this.guessLineHeightBuf(fontSize);
    const lineHeight = this.getLineHeight(attribute, textTheme, buf);

    if (whiteSpace === 'normal' || wrap) {
      return this.updateWrapAABBBounds(text);
    }
    if (!this.shouldUpdateShape() && this.cache?.layoutData) {
      const bbox = this.cache.layoutData.bbox;
      this._AABBBounds.set(bbox.xOffset, bbox.yOffset, bbox.xOffset + bbox.width, bbox.yOffset + bbox.height);
      if (stroke) {
        this._AABBBounds.expand(lineWidth / 2);
      }
      return this._AABBBounds;
    }
    const textMeasure = application.graphicUtil.textMeasure;
    const layoutObj = new CanvasTextLayout(fontFamily, { fontSize, fontWeight, fontFamily, lineHeight }, textMeasure);
    const layoutData = layoutObj.GetLayoutByLines(
      text,
      textAlign,
      textBaseline as any,
      lineHeight,
      ellipsis === true ? (textTheme.ellipsis as string) : ellipsis || undefined,
      false,
      {
        lineWidth: maxLineWidth,
        suffixPosition,
        measureMode,
        keepCenterInLine
      }
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
   * 计算多行文字的bounds，缓存每行文字的布局位置
   * 自动折行params.text是数组，因此只重新updateMultilineAABBBounds
   * @param text
   */
  updateWrapAABBBounds(text: (number | string) | (number | string)[]) {
    const textTheme = this.getGraphicTheme();
    const {
      fontFamily = textTheme.fontFamily,
      textAlign = textTheme.textAlign,
      textBaseline = textTheme.textBaseline,
      fontSize = textTheme.fontSize,
      ellipsis = textTheme.ellipsis,
      maxLineWidth,
      stroke = textTheme.stroke,
      lineWidth = textTheme.lineWidth,
      wordBreak = textTheme.wordBreak,
      fontWeight = textTheme.fontWeight,
      // widthLimit,
      ignoreBuf = textTheme.ignoreBuf,
      measureMode = textTheme.measureMode,
      suffixPosition = textTheme.suffixPosition,
      heightLimit = 0,
      lineClamp,
      keepCenterInLine = textTheme.keepCenterInLine
    } = this.attribute;

    const buf = ignoreBuf ? 0 : this.guessLineHeightBuf(fontSize);
    const lineHeight = this.getLineHeight(this.attribute, textTheme, buf);

    if (!this.shouldUpdateShape() && this.cache?.layoutData) {
      const bbox = this.cache.layoutData.bbox;
      this._AABBBounds.set(bbox.xOffset, bbox.yOffset, bbox.xOffset + bbox.width, bbox.yOffset + bbox.height);
      if (stroke) {
        this._AABBBounds.expand(lineWidth / 2);
      }
      return this._AABBBounds;
    }

    const textMeasure = application.graphicUtil.textMeasure;
    const textOptions = { fontSize, fontWeight, fontFamily, lineHeight };
    const layoutObj = new CanvasTextLayout(fontFamily, textOptions, textMeasure as any);

    // layoutObj内逻辑
    const lines = isArray(text) ? (text.map(l => l.toString()) as string[]) : [text.toString()];
    const linesLayout: LayoutItemType[] = [];
    const bboxWH: [number, number] = [0, 0];

    let lineCountLimit = Infinity;
    if (heightLimit > 0) {
      lineCountLimit = Math.max(Math.floor(heightLimit / lineHeight), 1);
    }
    if (lineClamp) {
      // 处理行数限制
      lineCountLimit = Math.min(lineCountLimit, lineClamp);
    }

    if (typeof maxLineWidth === 'number' && maxLineWidth !== Infinity) {
      // widthLimit > 0
      if (maxLineWidth > 0) {
        for (let i = 0; i < lines.length; i++) {
          const str = lines[i] as string;
          let needCut = true;

          // 判断是否超过高度限制
          if (i === lineCountLimit - 1) {
            // 当前行为最后一行，如果后面还有行，需要显示省略号
            const clip = textMeasure.clipTextWithSuffix(
              str,
              textOptions,
              maxLineWidth,
              ellipsis,
              false,
              suffixPosition,
              i !== lines.length - 1
            );
            const matrics = textMeasure.measureTextPixelADscentAndWidth(clip.str, textOptions, measureMode);
            linesLayout.push({
              str: clip.str,
              width: clip.width,
              ascent: matrics.ascent,
              descent: matrics.descent,
              keepCenterInLine
            });
            break; // 不处理后续行
          }

          // 测量截断位置
          const clip = textMeasure.clipText(
            str,
            textOptions,
            maxLineWidth,
            wordBreak !== 'break-all',
            wordBreak === 'keep-all'
          );
          if ((str !== '' && clip.str === '') || clip.wordBreaked) {
            if (ellipsis) {
              const clipEllipsis = textMeasure.clipTextWithSuffix(
                str,
                textOptions,
                maxLineWidth,
                ellipsis,
                false,
                suffixPosition
              );
              clip.str = clipEllipsis.str ?? '';
              clip.width = clipEllipsis.width ?? 0;
            } else {
              // 宽度限制不足一个字符，不显示
              clip.str = '';
              clip.width = 0;
            }
            needCut = false;
          }
          const matrics = textMeasure.measureTextPixelADscentAndWidth(clip.str, textOptions, measureMode);
          linesLayout.push({
            str: clip.str,
            width: clip.width,
            ascent: matrics.ascent,
            descent: matrics.descent,
            keepCenterInLine
          });
          let cutLength = clip.str.length;
          if (clip.wordBreaked && !(str !== '' && clip.str === '')) {
            needCut = true;
            cutLength = clip.wordBreaked;
          }
          if (clip.str.length === str.length) {
            // 不需要截断
          } else if (needCut) {
            let newStr = str.substring(cutLength);
            // 截断后，避免开头有空格很尬，去掉
            if (wordBreak === 'keep-all') {
              newStr = newStr.replace(/^\s+/g, '');
            }
            lines.splice(i + 1, 0, newStr);
          }
        }
      }
      // bboxWH[0] = maxLineWidth;
      let maxWidth = 0;
      linesLayout.forEach(layout => {
        maxWidth = Math.max(maxWidth, layout.width);
      });
      bboxWH[0] = maxWidth;
    } else {
      // 使用所有行中最长的作为lineWidth
      let lineWidth = 0;
      let width: number;
      let text: string;
      for (let i = 0, len = lines.length; i < len; i++) {
        // 判断是否超过高度限制
        if (i === lineCountLimit - 1) {
          // 当前行为最后一行
          const clip = textMeasure.clipTextWithSuffix(
            lines[i],
            textOptions,
            maxLineWidth,
            ellipsis,
            false,
            suffixPosition
          );
          const matrics = textMeasure.measureTextPixelADscentAndWidth(clip.str, textOptions, measureMode);
          linesLayout.push({
            str: clip.str,
            width: clip.width,
            ascent: matrics.ascent,
            descent: matrics.descent,
            keepCenterInLine
          });
          lineWidth = Math.max(lineWidth, clip.width);
          break; // 不处理后续行
        }

        text = lines[i] as string;
        width = textMeasure.measureTextWidth(text, textOptions);
        lineWidth = Math.max(lineWidth, width);
        const matrics = textMeasure.measureTextPixelADscentAndWidth(text, textOptions, measureMode);
        linesLayout.push({ str: text, width, ascent: matrics.ascent, descent: matrics.descent, keepCenterInLine });
      }
      bboxWH[0] = lineWidth;
    }
    bboxWH[1] = linesLayout.length * lineHeight;

    const bbox = {
      xOffset: 0,
      yOffset: 0,
      width: bboxWH[0],
      height: bboxWH[1]
    };

    layoutObj.LayoutBBox(bbox, textAlign, textBaseline as any, linesLayout);

    const layoutData = layoutObj.layoutWithBBox(bbox, linesLayout, textAlign, textBaseline as any, lineHeight);

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
  updateVerticalMultilineAABBBounds(text: (number | string)[]): IAABBBounds {
    const textTheme = this.getGraphicTheme();
    const textMeasure = application.graphicUtil.textMeasure;
    let width: number;
    const attribute = this.attribute;
    const {
      maxLineWidth = textTheme.maxLineWidth,
      ellipsis = textTheme.ellipsis,
      fontFamily = textTheme.fontFamily,
      fontSize = textTheme.fontSize,
      fontWeight = textTheme.fontWeight,
      stroke = textTheme.stroke,
      lineWidth = textTheme.lineWidth,
      // wordBreak = textTheme.wordBreak,
      verticalMode = textTheme.verticalMode,
      suffixPosition = textTheme.suffixPosition
    } = attribute;

    const lineHeight = this.getLineHeight(attribute, textTheme, 0);

    let { textAlign = textTheme.textAlign, textBaseline = textTheme.textBaseline } = attribute;
    if (!verticalMode) {
      const t = textAlign;
      textAlign = (Text.baselineMapAlign as any)[textBaseline] ?? 'left';
      textBaseline = (Text.alignMapBaseline as any)[t] ?? 'top';
    }
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
            false,
            suffixPosition
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

  // /**
  //  * 是否是简单文字
  //  * 单行，横排
  //  * @returns
  //  */
  // protected isSinglelineAndHorizontal(): boolean {
  //   return !this.isMultiLine && this.attribute.direction !== 'vertical';
  // }

  protected getMaxWidth(theme: ITextGraphicAttribute): number {
    // 传入了maxLineWidth就优先使用，否则使用maxWidth
    const attribute = this.attribute;
    return attribute.maxLineWidth ?? attribute.maxWidth ?? theme.maxWidth;
  }

  protected getLineHeight(attribute: ITextGraphicAttribute, textTheme: ITextGraphicAttribute, buf: number) {
    return (
      calculateLineHeight(attribute.lineHeight, attribute.fontSize || textTheme.fontSize) ??
      (attribute.fontSize || textTheme.fontSize) + buf
    );
  }

  protected needUpdateTags(keys: string[], k = TEXT_UPDATE_TAG_KEY): boolean {
    return super.needUpdateTags(keys, k);
  }
  protected needUpdateTag(key: string, k = TEXT_UPDATE_TAG_KEY): boolean {
    return super.needUpdateTag(key, k);
  }

  clone(): Text {
    return new Text({ ...this.attribute });
  }

  getNoWorkAnimateAttr(): Record<string, number> {
    return Text.NOWORK_ANIMATE_ATTR;
  }

  /**
   * 用于垂直布局时align和baseline相互转换
   * @returns
   */
  getBaselineMapAlign(): Record<string, string> {
    return Text.baselineMapAlign;
  }

  /**
   * 用于垂直布局时align和baseline相互转换
   * @returns
   */
  getAlignMapBaseline(): Record<string, string> {
    return Text.alignMapBaseline;
  }

  static baselineMapAlign = {
    top: 'left',
    bottom: 'right',
    middle: 'center'
  };

  static alignMapBaseline = {
    left: 'top',
    right: 'bottom',
    center: 'middle'
  };
}

export function createText(attributes: ITextGraphicAttribute): IText {
  return new Text(attributes);
}

// addAttributeToPrototype(DefaultLineStyle, Text, PURE_STYLE_KEY);
