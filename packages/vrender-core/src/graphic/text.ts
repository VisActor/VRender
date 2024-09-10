// import type { IAABBBounds } from '@visactor/vutils';
// import { max, isArray, getContextFont, transformBoundsWithMatrix } from '@visactor/vutils';
// import { textDrawOffsetX, textLayoutOffsetY } from '../common/text';
// import { CanvasTextLayout } from '../core/contributions/textMeasure/layout';
// import { application } from '../application';
// import type { IText, ITextCache, ITextGraphicAttribute, LayoutItemType, LayoutType } from '../interface';
// import { Graphic, GRAPHIC_UPDATE_TAG_KEY, NOWORK_ANIMATE_ATTR } from './graphic';
// import { getTheme } from './theme';
// import { calculateLineHeight } from '../common/utils';
// import { TEXT_NUMBER_TYPE } from './constants';
// import { boundStroke, TextDirection, verticalLayout } from './tools';

// const TEXT_UPDATE_TAG_KEY = [
//   'text',
//   'maxLineWidth',
//   // 多行文本要用到
//   'textAlign',
//   'textBaseline',
//   'heightLimit',
//   'lineClamp',
//   'fontSize',
//   'fontFamily',
//   'fontWeight',
//   'ellipsis',
//   'lineHeight',
//   'direction',
//   'wordBreak',
//   'heightLimit',
//   'lineClamp',
//   ...GRAPHIC_UPDATE_TAG_KEY
// ];

// export class Text extends Graphic<ITextGraphicAttribute> implements IText {
//   type: 'text' = 'text';

//   static NOWORK_ANIMATE_ATTR = {
//     ellipsis: 1,
//     wordBreak: 1,
//     direction: 1,
//     textAlign: 1,
//     textBaseline: 1,
//     fontFamily: 1,
//     fontWeight: 1,
//     ...NOWORK_ANIMATE_ATTR
//   };

//   cache: ITextCache;
//   _font: string;

//   get font(): string {
//     const textTheme = this.getGraphicTheme();
//     if (!this._font) {
//       this._font = getContextFont(this.attribute, textTheme);
//     }
//     return this._font as string;
//   }

//   get clipedText(): string | undefined {
//     const attribute = this.attribute;
//     const textTheme = this.getGraphicTheme();
//     if (!this.isSimplify()) {
//       return undefined;
//     }
//     const { maxLineWidth = textTheme.maxLineWidth } = attribute;
//     if (!Number.isFinite(maxLineWidth)) {
//       return (attribute.text ?? textTheme.text).toString();
//     }
//     this.tryUpdateAABBBounds();
//     return this.cache.clipedText;
//   }
//   get clipedWidth(): number | undefined {
//     if (!this.isSimplify()) {
//       return undefined;
//     }
//     this.tryUpdateAABBBounds();
//     return this.cache.clipedWidth;
//   }
//   get cliped(): boolean | undefined {
//     const textTheme = this.getGraphicTheme();
//     const attribute = this.attribute;
//     if (this.isMultiLine) {
//       return undefined;
//     }
//     const { maxLineWidth = textTheme.maxLineWidth } = attribute;
//     if (!Number.isFinite(maxLineWidth)) {
//       return false;
//     }
//     this.tryUpdateAABBBounds();
//     if (attribute.direction === 'vertical' && this.cache.verticalList && this.cache.verticalList[0]) {
//       return this.cache.verticalList[0].map(item => item.text).join('') !== attribute.text.toString();
//     }
//     if (this.clipedText == null) {
//       return false;
//     }
//     return this.clipedText !== attribute.text.toString();
//   }
//   get multilineLayout(): LayoutType | undefined {
//     if (!this.isMultiLine) {
//       return undefined;
//     }
//     this.tryUpdateAABBBounds();
//     return this.cache.layoutData;
//   }

//   // 是否是简单文字
//   // 单行，横排
//   private isSimplify(): boolean {
//     return !this.isMultiLine && this.attribute.direction !== 'vertical';
//   }
//   get isMultiLine(): boolean {
//     return Array.isArray(this.attribute.text) || this.attribute.whiteSpace === 'normal';
//   }

//   constructor(params: ITextGraphicAttribute = { text: '', fontSize: 16 }) {
//     super(params);
//     this.numberType = TEXT_NUMBER_TYPE;
//     this.cache = {};
//   }

//   isValid(): boolean {
//     return super.isValid() && this._isValid();
//   }
//   protected _isValid(): boolean {
//     const { text } = this.attribute;
//     if (isArray(text)) {
//       return !(text as any[]).every((t: any) => t == null || t === '');
//     }
//     return text != null && text !== '';
//   }

//   getGraphicTheme(): Required<ITextGraphicAttribute> {
//     return getTheme(this).text;
//   }

//   protected updateAABBBounds(
//     attribute: ITextGraphicAttribute,
//     textTheme: Required<ITextGraphicAttribute>,
//     aabbBounds: IAABBBounds
//   ) {
//     const { text = textTheme.text } = this.attribute;
//     if (Array.isArray(text)) {
//       this.updateMultilineAABBBounds(text as (number | string)[]);
//     } else {
//       this.updateSingallineAABBBounds(text as number | string);
//     }

//     const { tb1 } = application.graphicService.updateTempAABBBounds(aabbBounds);

//     const {
//       scaleX = textTheme.scaleX,
//       scaleY = textTheme.scaleY,
//       shadowBlur = textTheme.shadowBlur,
//       strokeBoundsBuffer = textTheme.strokeBoundsBuffer
//     } = attribute;
//     if (shadowBlur) {
//       const shadowBlurHalfWidth = shadowBlur / Math.abs(scaleX + scaleY);
//       boundStroke(tb1, shadowBlurHalfWidth, true, strokeBoundsBuffer);
//       aabbBounds.union(tb1);
//     }
//     // 合并shadowRoot的bounds
//     application.graphicService.combindShadowAABBBounds(aabbBounds, this);

//     if (attribute.forceBoundsHeight != null || attribute.forceBoundsWidth != null) {
//       application.graphicService.updateHTMLTextAABBBounds(attribute, textTheme, aabbBounds);
//     }

//     transformBoundsWithMatrix(aabbBounds, aabbBounds, this.transMatrix);
//     return aabbBounds;
//   }

//   /**
//    * 计算多行文字的bounds，缓存每行文字的布局位置
//    * 自动折行params.text是数组，因此只重新updateMultilineAABBBounds
//    * @param text
//    */
//   updateWrapAABBBounds(text: (number | string) | (number | string)[]) {
//     const textTheme = this.getGraphicTheme();
//     const {
//       fontFamily = textTheme.fontFamily,
//       textAlign = textTheme.textAlign,
//       textBaseline = textTheme.textBaseline,
//       fontSize = textTheme.fontSize,
//       ellipsis = textTheme.ellipsis,
//       maxLineWidth,
//       stroke = textTheme.stroke,
//       lineWidth = textTheme.lineWidth,
//       wordBreak = textTheme.wordBreak,
//       fontWeight = textTheme.fontWeight,
//       // widthLimit,
//       ignoreBuf = textTheme.ignoreBuf,
//       suffixPosition = textTheme.suffixPosition,
//       heightLimit = 0,
//       lineClamp
//     } = this.attribute;
//     const lineHeight =
//       calculateLineHeight(this.attribute.lineHeight, this.attribute.fontSize || textTheme.fontSize) ??
//       (this.attribute.fontSize || textTheme.fontSize);
//     const buf = ignoreBuf ? 0 : 2;
//     if (!this.shouldUpdateShape() && this.cache?.layoutData) {
//       const bbox = this.cache.layoutData.bbox;
//       this._AABBBounds.set(bbox.xOffset, bbox.yOffset, bbox.xOffset + bbox.width, bbox.yOffset + bbox.height);
//       if (stroke) {
//         this._AABBBounds.expand(lineWidth / 2);
//       }
//       return this._AABBBounds;
//     }

//     const textMeasure = application.graphicUtil.textMeasure;
//     const layoutObj = new CanvasTextLayout(fontFamily, { fontSize, fontWeight, fontFamily }, textMeasure as any) as any;

//     // layoutObj内逻辑
//     const lines = isArray(text) ? (text.map(l => l.toString()) as string[]) : [text.toString()];
//     const linesLayout: LayoutItemType[] = [];
//     const bboxWH: [number, number] = [0, 0];

//     let lineCountLimit = Infinity;
//     if (heightLimit > 0) {
//       lineCountLimit = Math.max(Math.floor(heightLimit / lineHeight), 1);
//     }
//     if (lineClamp) {
//       // 处理行数限制
//       lineCountLimit = Math.min(lineCountLimit, lineClamp);
//     }

//     if (typeof maxLineWidth === 'number' && maxLineWidth !== Infinity) {
//       // widthLimit > 0
//       if (maxLineWidth > 0) {
//         for (let i = 0; i < lines.length; i++) {
//           const str = lines[i] as string;
//           let needCut = true;
//           // // 测量当前行宽度
//           // width = Math.min(
//           //   layoutObj.textMeasure.measureTextWidth(str, layoutObj.textOptions),
//           //   maxLineWidth
//           // );

//           // 判断是否超过高度限制
//           if (i === lineCountLimit - 1) {
//             // 当前行为最后一行，如果后面还有行，需要显示省略号
//             const clip = layoutObj.textMeasure.clipTextWithSuffix(
//               str,
//               layoutObj.textOptions,
//               maxLineWidth,
//               ellipsis,
//               false,
//               suffixPosition,
//               i !== lines.length - 1
//             );
//             linesLayout.push({
//               str: clip.str,
//               width: clip.width
//             });
//             break; // 不处理后续行
//           }

//           // 测量截断位置
//           const clip = layoutObj.textMeasure.clipText(
//             str,
//             layoutObj.textOptions,
//             maxLineWidth,
//             wordBreak === 'break-word'
//           );
//           if (str !== '' && clip.str === '') {
//             if (ellipsis) {
//               const clipEllipsis = layoutObj.textMeasure.clipTextWithSuffix(
//                 str,
//                 layoutObj.textOptions,
//                 maxLineWidth,
//                 ellipsis,
//                 false,
//                 suffixPosition
//               );
//               clip.str = clipEllipsis.str ?? '';
//               clip.width = clipEllipsis.width ?? 0;
//             } else {
//               // 宽度限制不足一个字符，不显示
//               clip.str = '';
//               clip.width = 0;
//             }
//             needCut = false;
//           }

//           linesLayout.push({
//             str: clip.str,
//             width: clip.width
//           });
//           if (clip.str.length === str.length) {
//             // 不需要截断
//           } else if (needCut) {
//             const newStr = str.substring(clip.str.length);
//             lines.splice(i + 1, 0, newStr);
//           }
//         }
//       }
//       // bboxWH[0] = maxLineWidth;
//       let maxWidth = 0;
//       linesLayout.forEach(layout => {
//         maxWidth = Math.max(maxWidth, layout.width);
//       });
//       bboxWH[0] = maxWidth;
//     } else {
//       // 使用所有行中最长的作为lineWidth
//       let lineWidth = 0;
//       let width: number;
//       let text: string;
//       for (let i = 0, len = lines.length; i < len; i++) {
//         // 判断是否超过高度限制
//         if (i === lineCountLimit - 1) {
//           // 当前行为最后一行
//           const clip = layoutObj.textMeasure.clipTextWithSuffix(
//             lines[i],
//             layoutObj.textOptions,
//             maxLineWidth,
//             ellipsis,
//             false,
//             suffixPosition
//           );
//           linesLayout.push({
//             str: clip.str,
//             width: clip.width
//           });
//           lineWidth = Math.max(lineWidth, clip.width);
//           break; // 不处理后续行
//         }

//         text = lines[i] as string;
//         width = layoutObj.textMeasure.measureTextWidth(text, layoutObj.textOptions, wordBreak === 'break-word');
//         lineWidth = Math.max(lineWidth, width);
//         linesLayout.push({ str: text, width });
//       }
//       bboxWH[0] = lineWidth;
//     }
//     bboxWH[1] = linesLayout.length * (lineHeight + buf);

//     const bbox = {
//       xOffset: 0,
//       yOffset: 0,
//       width: bboxWH[0],
//       height: bboxWH[1]
//     };

//     layoutObj.LayoutBBox(bbox, textAlign, textBaseline as any);

//     const layoutData = layoutObj.layoutWithBBox(bbox, linesLayout, textAlign, textBaseline as any, lineHeight);

//     // const layoutData = layoutObj.GetLayoutByLines(
//     //   text,
//     //   textAlign,
//     //   textBaseline as any,
//     //   lineHeight,
//     //   ellipsis === true ? (DefaultTextAttribute.ellipsis as string) : ellipsis || undefined,
//     //   maxLineWidth
//     // );
//     // const { bbox } = layoutData;
//     this.cache.layoutData = layoutData;
//     this.clearUpdateShapeTag();
//     this._AABBBounds.set(bbox.xOffset, bbox.yOffset, bbox.xOffset + bbox.width, bbox.yOffset + bbox.height);

//     if (stroke) {
//       this._AABBBounds.expand(lineWidth / 2);
//     }

//     return this._AABBBounds;
//   }

//   /**
//    * 计算单行文字的bounds，可以缓存长度以及截取的文字
//    * @param text
//    */
//   updateSingallineAABBBounds(text: number | string): IAABBBounds {
//     const textTheme = this.getGraphicTheme();
//     const { direction = textTheme.direction, underlineOffset = textTheme.underlineOffset } = this.attribute;

//     const b =
//       direction === 'horizontal'
//         ? this.updateHorizontalSinglelineAABBBounds(text)
//         : this.updateVerticalSinglelineAABBBounds(text);
//     if (direction === 'horizontal') {
//       if (underlineOffset) {
//         this._AABBBounds.add(this._AABBBounds.x1, this._AABBBounds.y2 + underlineOffset);
//       }
//     }
//     return b;
//   }

//   /**
//    * 计算单行文字的bounds，可以缓存长度以及截取的文字
//    * @param text
//    */
//   updateMultilineAABBBounds(text: (number | string)[]): IAABBBounds {
//     const textTheme = this.getGraphicTheme();
//     const { direction = textTheme.direction, underlineOffset = textTheme.underlineOffset } = this.attribute;

//     const b =
//       direction === 'horizontal'
//         ? this.updateHorizontalMultilineAABBBounds(text)
//         : this.updateVerticalMultilineAABBBounds(text);

//     if (direction === 'horizontal') {
//       if (underlineOffset) {
//         this._AABBBounds.add(this._AABBBounds.x1, this._AABBBounds.y2 + underlineOffset);
//       }
//     }
//     return b;
//   }

//   /**
//    * 计算单行文字的bounds，可以缓存长度以及截取的文字
//    * @param text
//    */
//   updateHorizontalSinglelineAABBBounds(text: number | string): IAABBBounds {
//     const textTheme = this.getGraphicTheme();
//     const { wrap = textTheme.wrap } = this.attribute;
//     if (wrap) {
//       return this.updateWrapAABBBounds([text]);
//     }

//     const textMeasure = application.graphicUtil.textMeasure;
//     let width: number;
//     let str: string;
//     const attribute = this.attribute;
//     const {
//       maxLineWidth = textTheme.maxLineWidth,
//       ellipsis = textTheme.ellipsis,
//       textAlign = textTheme.textAlign,
//       textBaseline = textTheme.textBaseline,
//       fontFamily = textTheme.fontFamily,
//       fontSize = textTheme.fontSize,
//       fontWeight = textTheme.fontWeight,
//       stroke = textTheme.stroke,
//       lineWidth = textTheme.lineWidth,
//       // wordBreak = textTheme.wordBreak,
//       ignoreBuf = textTheme.ignoreBuf,
//       whiteSpace = textTheme.whiteSpace,
//       suffixPosition = textTheme.suffixPosition
//     } = attribute;
//     if (whiteSpace === 'normal') {
//       return this.updateWrapAABBBounds(text);
//     }
//     const buf = ignoreBuf ? 0 : Math.max(2, fontSize * 0.075);
//     const textFontSize = attribute.fontSize || textTheme.fontSize;
//     const lineHeight = calculateLineHeight(attribute.lineHeight, textFontSize) ?? textFontSize + buf;
//     if (!this.shouldUpdateShape() && this.cache) {
//       width = this.cache.clipedWidth ?? 0;
//       const dx = textDrawOffsetX(textAlign, width);
//       const dy = textLayoutOffsetY(textBaseline, lineHeight, fontSize);
//       this._AABBBounds.set(dx, dy, dx + width, dy + lineHeight);
//       if (stroke) {
//         this._AABBBounds.expand(lineWidth / 2);
//       }
//       return this._AABBBounds;
//     }

//     if (Number.isFinite(maxLineWidth)) {
//       if (ellipsis) {
//         const strEllipsis = (ellipsis === true ? textTheme.ellipsis : ellipsis) as string;
//         const data = textMeasure.clipTextWithSuffix(
//           text.toString(),
//           { fontSize, fontWeight, fontFamily },
//           maxLineWidth,
//           strEllipsis,
//           false,
//           suffixPosition
//         );
//         str = data.str;
//         width = data.width;
//       } else {
//         const data = textMeasure.clipText(text.toString(), { fontSize, fontWeight, fontFamily }, maxLineWidth, false);
//         str = data.str;
//         width = data.width;
//       }
//       this.cache.clipedText = str;
//       this.cache.clipedWidth = width;
//       // todo 计算原本的宽度
//     } else {
//       width = textMeasure.measureTextWidth(text.toString(), { fontSize, fontWeight, fontFamily });
//       this.cache.clipedText = text.toString();
//       this.cache.clipedWidth = width;
//     }
//     this.clearUpdateShapeTag();

//     const dx = textDrawOffsetX(textAlign, width);
//     let lh = lineHeight;
//     if (application.global && application.global.isSafari()) {
//       // 如果是safari，那么需要额外增加高度
//       lh += fontSize * 0.2;
//     }
//     const dy = textLayoutOffsetY(textBaseline, lh, fontSize, buf);
//     this._AABBBounds.set(dx, dy, dx + width, dy + lh);

//     if (stroke) {
//       this._AABBBounds.expand(lineWidth / 2);
//     }

//     return this._AABBBounds;
//   }

//   getBaselineMapAlign(): Record<string, string> {
//     return Text.baselineMapAlign;
//   }

//   getAlignMapBaseline(): Record<string, string> {
//     return Text.alignMapBaseline;
//   }

//   static baselineMapAlign = {
//     top: 'left',
//     bottom: 'right',
//     middle: 'center'
//   };

//   static alignMapBaseline = {
//     left: 'top',
//     right: 'bottom',
//     center: 'middle'
//   };

//   /**
//    * 计算垂直布局的单行文字的bounds，可以缓存长度以及截取的文字
//    * @param text
//    */
//   updateVerticalSinglelineAABBBounds(text: number | string): IAABBBounds {
//     const textTheme = this.getGraphicTheme();
//     const textMeasure = application.graphicUtil.textMeasure;
//     let width: number;
//     let str: string;
//     const attribute = this.attribute;
//     const { ignoreBuf = textTheme.ignoreBuf } = attribute;
//     const buf = ignoreBuf ? 0 : 2;
//     const {
//       maxLineWidth = textTheme.maxLineWidth,
//       ellipsis = textTheme.ellipsis,
//       fontSize = textTheme.fontSize,
//       fontWeight = textTheme.fontWeight,
//       fontFamily = textTheme.fontFamily,
//       stroke = textTheme.stroke,
//       lineWidth = textTheme.lineWidth,
//       verticalMode = textTheme.verticalMode,
//       suffixPosition = textTheme.suffixPosition
//     } = attribute;

//     const lineHeight =
//       calculateLineHeight(attribute.lineHeight, attribute.fontSize || textTheme.fontSize) ??
//       (attribute.fontSize || textTheme.fontSize) + buf;

//     let { textAlign = textTheme.textAlign, textBaseline = textTheme.textBaseline } = attribute;
//     if (!verticalMode) {
//       const t = textAlign;
//       textAlign = (Text.baselineMapAlign as any)[textBaseline] ?? 'left';
//       textBaseline = (Text.alignMapBaseline as any)[t] ?? 'top';
//     }
//     if (!this.shouldUpdateShape() && this.cache) {
//       width = this.cache.clipedWidth;
//       const dx = textDrawOffsetX(textAlign, width);
//       const dy = textLayoutOffsetY(textBaseline, lineHeight, fontSize);
//       this._AABBBounds.set(dy, dx, dy + lineHeight, dx + width);
//       if (stroke) {
//         this._AABBBounds.expand(lineWidth / 2);
//       }
//       return this._AABBBounds;
//     }

//     let verticalList: { text: string; width?: number; direction: TextDirection }[][] = [
//       verticalLayout(text.toString())
//     ];
//     if (Number.isFinite(maxLineWidth)) {
//       if (ellipsis) {
//         const strEllipsis = (ellipsis === true ? textTheme.ellipsis : ellipsis) as string;
//         const data = textMeasure.clipTextWithSuffixVertical(
//           verticalList[0],
//           { fontSize, fontWeight, fontFamily },
//           maxLineWidth,
//           strEllipsis,
//           false,
//           suffixPosition
//         );
//         verticalList = [data.verticalList];
//         width = data.width;
//       } else {
//         const data = textMeasure.clipTextVertical(
//           verticalList[0],
//           { fontSize, fontWeight, fontFamily },
//           maxLineWidth,
//           false
//         );
//         verticalList = [data.verticalList];
//         width = data.width;
//       }
//       this.cache.verticalList = verticalList;
//       this.cache.clipedWidth = width;
//       // todo 计算原本的宽度
//     } else {
//       width = 0;
//       verticalList[0].forEach(t => {
//         const w =
//           t.direction === TextDirection.HORIZONTAL
//             ? fontSize
//             : textMeasure.measureTextWidth(t.text, { fontSize, fontWeight, fontFamily });

//         width += w;
//         t.width = w;
//       });
//       this.cache.verticalList = verticalList;
//       this.cache.clipedWidth = width;
//     }
//     this.clearUpdateShapeTag();

//     const dx = textDrawOffsetX(textAlign, width);
//     const dy = textLayoutOffsetY(textBaseline, lineHeight, fontSize);
//     this._AABBBounds.set(dy, dx, dy + lineHeight, dx + width);

//     if (stroke) {
//       this._AABBBounds.expand(lineWidth / 2);
//     }

//     return this._AABBBounds;
//   }

//   /**
//    * 计算多行文字的bounds，缓存每行文字的布局位置
//    * @param text
//    */
//   updateHorizontalMultilineAABBBounds(text: (number | string)[]): IAABBBounds {
//     const textTheme = this.getGraphicTheme();
//     const { wrap = textTheme.wrap } = this.attribute;
//     if (wrap) {
//       return this.updateWrapAABBBounds(text);
//     }

//     const attribute = this.attribute;
//     const {
//       fontFamily = textTheme.fontFamily,
//       textAlign = textTheme.textAlign,
//       textBaseline = textTheme.textBaseline,
//       fontSize = textTheme.fontSize,
//       fontWeight = textTheme.fontWeight,
//       ellipsis = textTheme.ellipsis,
//       maxLineWidth,
//       stroke = textTheme.stroke,
//       // ignoreBuf = textTheme.ignoreBuf,
//       lineWidth = textTheme.lineWidth,
//       whiteSpace = textTheme.whiteSpace,
//       suffixPosition = textTheme.suffixPosition
//     } = attribute;
//     // const buf = ignoreBuf ? 0 : Math.max(2, fontSize * 0.075);
//     const lineHeight =
//       calculateLineHeight(attribute.lineHeight, attribute.fontSize || textTheme.fontSize) ??
//       (attribute.fontSize || textTheme.fontSize);
//     if (whiteSpace === 'normal') {
//       return this.updateWrapAABBBounds(text);
//     }
//     if (!this.shouldUpdateShape() && this.cache?.layoutData) {
//       const bbox = this.cache.layoutData.bbox;
//       this._AABBBounds.set(bbox.xOffset, bbox.yOffset, bbox.xOffset + bbox.width, bbox.yOffset + bbox.height);
//       if (stroke) {
//         this._AABBBounds.expand(lineWidth / 2);
//       }
//       return this._AABBBounds;
//     }
//     const textMeasure = application.graphicUtil.textMeasure;
//     const layoutObj = new CanvasTextLayout(fontFamily, { fontSize, fontWeight, fontFamily }, textMeasure);
//     const layoutData = layoutObj.GetLayoutByLines(
//       text,
//       textAlign,
//       textBaseline as any,
//       lineHeight,
//       ellipsis === true ? (textTheme.ellipsis as string) : ellipsis || undefined,
//       false,
//       maxLineWidth,
//       suffixPosition
//     );
//     const { bbox } = layoutData;
//     this.cache.layoutData = layoutData;
//     this.clearUpdateShapeTag();

//     this._AABBBounds.set(bbox.xOffset, bbox.yOffset, bbox.xOffset + bbox.width, bbox.yOffset + bbox.height);

//     if (stroke) {
//       this._AABBBounds.expand(lineWidth / 2);
//     }

//     return this._AABBBounds;
//   }

//   /**
//    * 计算垂直布局的多行文字的bounds，可以缓存长度以及截取的文字
//    * @param text
//    */
//   updateVerticalMultilineAABBBounds(text: (number | string)[]): IAABBBounds {
//     const textTheme = this.getGraphicTheme();
//     const textMeasure = application.graphicUtil.textMeasure;
//     let width: number;
//     const attribute = this.attribute;
//     const { ignoreBuf = textTheme.ignoreBuf } = attribute;
//     const buf = ignoreBuf ? 0 : 2;
//     const {
//       maxLineWidth = textTheme.maxLineWidth,
//       ellipsis = textTheme.ellipsis,
//       fontFamily = textTheme.fontFamily,
//       fontSize = textTheme.fontSize,
//       fontWeight = textTheme.fontWeight,
//       stroke = textTheme.stroke,
//       lineWidth = textTheme.lineWidth,
//       // wordBreak = textTheme.wordBreak,
//       verticalMode = textTheme.verticalMode,
//       suffixPosition = textTheme.suffixPosition
//     } = attribute;
//     const lineHeight =
//       calculateLineHeight(attribute.lineHeight, attribute.fontSize || textTheme.fontSize) ??
//       (attribute.fontSize || textTheme.fontSize) + buf;
//     let { textAlign = textTheme.textAlign, textBaseline = textTheme.textBaseline } = attribute;
//     if (!verticalMode) {
//       const t = textAlign;
//       textAlign = (Text.baselineMapAlign as any)[textBaseline] ?? 'left';
//       textBaseline = (Text.alignMapBaseline as any)[t] ?? 'top';
//     }
//     width = 0;
//     if (!this.shouldUpdateShape() && this.cache) {
//       this.cache.verticalList.forEach(item => {
//         const w = item.reduce((a, b) => a + b.width, 0);
//         width = max(w, width);
//       });
//       const dx = textDrawOffsetX(textAlign, width);
//       const height = this.cache.verticalList.length * lineHeight;
//       const dy = textLayoutOffsetY(textBaseline, height, fontSize);
//       this._AABBBounds.set(dy, dx, dy + height, dx + width);
//       if (stroke) {
//         this._AABBBounds.expand(lineWidth / 2);
//       }
//       return this._AABBBounds;
//     }

//     const verticalLists: { text: string; width?: number; direction: TextDirection }[][] = text.map(str => {
//       return verticalLayout(str.toString());
//     });
//     verticalLists.forEach((verticalData, i) => {
//       if (Number.isFinite(maxLineWidth)) {
//         if (ellipsis) {
//           const strEllipsis = (ellipsis === true ? textTheme.ellipsis : ellipsis) as string;
//           const data = textMeasure.clipTextWithSuffixVertical(
//             verticalData,
//             { fontSize, fontWeight, fontFamily },
//             maxLineWidth,
//             strEllipsis,
//             false,
//             suffixPosition
//           );
//           verticalLists[i] = data.verticalList;
//           width = data.width;
//         } else {
//           const data = textMeasure.clipTextVertical(
//             verticalData,
//             { fontSize, fontWeight, fontFamily },
//             maxLineWidth,
//             false
//           );
//           verticalLists[i] = data.verticalList;
//           width = data.width;
//         }
//         // this.cache.clipedWidth = width;
//         // todo 计算原本的宽度
//       } else {
//         width = 0;
//         verticalData.forEach(t => {
//           const w =
//             t.direction === TextDirection.HORIZONTAL
//               ? fontSize
//               : textMeasure.measureTextWidth(t.text, { fontSize, fontWeight, fontFamily });

//           width += w;
//           t.width = w;
//         });
//       }
//     });
//     this.cache.verticalList = verticalLists;
//     this.clearUpdateShapeTag();

//     this.cache.verticalList.forEach(item => {
//       const w = item.reduce((a, b) => a + b.width, 0);
//       width = max(w, width);
//     });

//     const dx = textDrawOffsetX(textAlign, width);
//     const height = this.cache.verticalList.length * lineHeight;
//     const dy = textLayoutOffsetY(textBaseline, height, fontSize);
//     this._AABBBounds.set(dy, dx, dy + height, dx + width);

//     if (stroke) {
//       this._AABBBounds.expand(lineWidth / 2);
//     }

//     return this._AABBBounds;
//   }

//   protected needUpdateTags(keys: string[], k = TEXT_UPDATE_TAG_KEY): boolean {
//     return super.needUpdateTags(keys, k);
//   }
//   protected needUpdateTag(key: string, k = TEXT_UPDATE_TAG_KEY): boolean {
//     return super.needUpdateTag(key, k);
//   }

//   clone(): Text {
//     return new Text({ ...this.attribute });
//   }

//   getNoWorkAnimateAttr(): Record<string, number> {
//     return Text.NOWORK_ANIMATE_ATTR;
//   }
// }

// export function createText(attributes: ITextGraphicAttribute): IText {
//   return new Text(attributes);
// }

// // addAttributeToPrototype(DefaultLineStyle, Text, PURE_STYLE_KEY);

import type { IAABBBounds } from '@visactor/vutils';
import { max, isArray, getContextFont, transformBoundsWithMatrix } from '@visactor/vutils';
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
    this.tryUpdateAABBBounds();
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
    if (layoutData) {
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
      ignoreBuf = textTheme.ignoreBuf,
      lineWidth = textTheme.lineWidth,
      whiteSpace = textTheme.whiteSpace,
      suffixPosition = textTheme.suffixPosition
    } = attribute;

    const buf = ignoreBuf ? 0 : 2;
    const lineHeight = this.getLineHeight(attribute, textTheme) + buf;

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
    const layoutObj = new CanvasTextLayout(fontFamily, { fontSize, fontWeight, fontFamily }, textMeasure);
    const layoutData = layoutObj.GetLayoutByLines(
      text,
      textAlign,
      textBaseline as any,
      lineHeight,
      ellipsis === true ? (textTheme.ellipsis as string) : ellipsis || undefined,
      false,
      maxLineWidth,
      suffixPosition
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
      suffixPosition = textTheme.suffixPosition,
      heightLimit = 0,
      lineClamp
    } = this.attribute;

    const buf = ignoreBuf ? 0 : 2;
    const lineHeight = this.getLineHeight(this.attribute, textTheme) + buf;

    if (!this.shouldUpdateShape() && this.cache?.layoutData) {
      const bbox = this.cache.layoutData.bbox;
      this._AABBBounds.set(bbox.xOffset, bbox.yOffset, bbox.xOffset + bbox.width, bbox.yOffset + bbox.height);
      if (stroke) {
        this._AABBBounds.expand(lineWidth / 2);
      }
      return this._AABBBounds;
    }

    const textMeasure = application.graphicUtil.textMeasure;
    const textOptions = { fontSize, fontWeight, fontFamily };
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
            const matrics = textMeasure.measureTextPixelADscentAndWidth(clip.str, textOptions);
            linesLayout.push({
              str: clip.str,
              width: clip.width,
              ascent: matrics.ascent,
              descent: matrics.descent
            });
            break; // 不处理后续行
          }

          // 测量截断位置
          const clip = textMeasure.clipText(str, textOptions, maxLineWidth, wordBreak === 'break-word');
          if (str !== '' && clip.str === '') {
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
          const matrics = textMeasure.measureTextPixelADscentAndWidth(clip.str, textOptions);
          linesLayout.push({
            str: clip.str,
            width: clip.width,
            ascent: matrics.ascent,
            descent: matrics.descent
          });
          if (clip.str.length === str.length) {
            // 不需要截断
          } else if (needCut) {
            const newStr = str.substring(clip.str.length);
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
          const matrics = textMeasure.measureTextPixelADscentAndWidth(clip.str, textOptions);
          linesLayout.push({
            str: clip.str,
            width: clip.width,
            ascent: matrics.ascent,
            descent: matrics.descent
          });
          lineWidth = Math.max(lineWidth, clip.width);
          break; // 不处理后续行
        }

        text = lines[i] as string;
        width = textMeasure.measureTextWidth(text, textOptions);
        lineWidth = Math.max(lineWidth, width);
        const matrics = textMeasure.measureTextPixelADscentAndWidth(text, textOptions);
        linesLayout.push({ str: text, width, ascent: matrics.ascent, descent: matrics.descent });
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

    layoutObj.LayoutBBox(bbox, textAlign, textBaseline as any);

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

    const lineHeight = this.getLineHeight(attribute, textTheme);

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

  protected getLineHeight(attribute: ITextGraphicAttribute, textTheme: ITextGraphicAttribute) {
    return (
      calculateLineHeight(attribute.lineHeight, attribute.fontSize || textTheme.fontSize) ??
      (attribute.fontSize || textTheme.fontSize)
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
