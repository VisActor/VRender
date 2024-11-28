import type { vec2 } from '@visactor/vutils';
import type { ITextMeasure, TextOptionsType } from '../../../interface/text';
import type { TextLayoutBBox, LayoutItemType, LayoutType, TextAlignType, TextBaselineType } from '../../../interface';
import { MeasureModeEnum } from '../../../interface';

export class CanvasTextLayout {
  private fontFamily: string;
  private textOptions: TextOptionsType;
  private textMeasure: ITextMeasure;

  constructor(fontFamily: string, options: TextOptionsType, textMeasure: ITextMeasure) {
    this.fontFamily = fontFamily;
    this.textOptions = options;
    this.textMeasure = textMeasure;
  }

  /**
   * 布局外部的盒子，盒子的alphabetic属性模拟文字的效果
   * @param bbox
   * @param textAlign
   * @param textBaseline
   * @returns
   */
  LayoutBBox(
    bbox: TextLayoutBBox,
    textAlign: TextAlignType,
    textBaseline: TextBaselineType,
    linesLayout: LayoutItemType[]
  ): TextLayoutBBox {
    if (textAlign === 'left' || textAlign === 'start') {
      bbox.xOffset = 0;
    } else if (textAlign === 'center') {
      bbox.xOffset = bbox.width / -2;
    } else if (textAlign === 'right' || textAlign === 'end') {
      bbox.xOffset = -bbox.width;
    } else {
      bbox.xOffset = 0;
    }

    if (textBaseline === 'top') {
      bbox.yOffset = 0;
    } else if (textBaseline === 'middle') {
      bbox.yOffset = bbox.height / -2;
    } else if (textBaseline === 'alphabetic') {
      // 如果仅有一行，要保证和直接使用canvas绘制的textBaseline一致
      let percent = 0.79;
      if (linesLayout.length === 1) {
        const lineInfo = linesLayout[0];
        percent = lineInfo.ascent / (lineInfo.ascent + lineInfo.descent);
      }
      bbox.yOffset = bbox.height * -percent;
    } else {
      bbox.yOffset = -bbox.height;
    }

    return bbox;
  }

  /**
   * 给定拆分好的每行字符串进行布局，如果传入lineWidth，那么后面的字符就拆分
   * @param lines
   * @param lineWidth
   */
  GetLayoutByLines(
    lines: (string | number)[],
    textAlign: TextAlignType,
    textBaseline: TextBaselineType,
    lineHeight: number,
    suffix: string = '',
    wordBreak: boolean,
    params?: {
      lineWidth?: number;
      suffixPosition?: 'start' | 'end' | 'middle';
      measureMode?: MeasureModeEnum;
      keepCenterInLine?: boolean;
    }
  ): LayoutType {
    const {
      lineWidth,
      suffixPosition = 'end',
      measureMode = MeasureModeEnum.actualBounding,
      keepCenterInLine = false
    } = params ?? {};
    lines = lines.map(l => l.toString()) as string[];
    const linesLayout: LayoutItemType[] = [];
    // bbox高度可能大于totalHeight
    const bboxWH: vec2 = [0, 0];
    if (typeof lineWidth === 'number' && lineWidth !== Infinity) {
      // 直接使用lineWidth，并拆分字符串
      let width: number;
      for (let i = 0, len = lines.length; i < len; i++) {
        const metrics = this.textMeasure.measureTextPixelADscentAndWidth(
          lines[i] as string,
          this.textOptions,
          measureMode
        );
        let str: string = lines[i].toString();
        // 大于最大宽度，需要裁剪
        if (metrics.width > lineWidth) {
          const data = this.textMeasure.clipTextWithSuffix(
            lines[i] as string,
            this.textOptions,
            lineWidth,
            suffix,
            wordBreak,
            suffixPosition
          );
          str = data.str;
          width = data.width;
        } else {
          // 小于最大宽度，不需要裁剪，直接取文字总宽度即可
          width = metrics.width;
        }
        linesLayout.push({
          str,
          width,
          ascent: metrics.ascent,
          descent: metrics.descent,
          keepCenterInLine
        });
      }
      bboxWH[0] = lineWidth;
    } else {
      // 使用所有行中最长的作为lineWidth
      let _lineWidth = 0;
      let width: number;
      let text: string;
      for (let i = 0, len = lines.length; i < len; i++) {
        text = lines[i] as string;
        const metrics = this.textMeasure.measureTextPixelADscentAndWidth(
          lines[i] as string,
          this.textOptions,
          measureMode
        );
        width = metrics.width;
        _lineWidth = Math.max(_lineWidth, width);
        linesLayout.push({ str: text, width, ascent: metrics.ascent, descent: metrics.descent, keepCenterInLine });
      }
      bboxWH[0] = _lineWidth;
    }
    bboxWH[1] = linesLayout.length * lineHeight;

    bboxWH[0] = linesLayout.reduce((a, b) => Math.max(a, b.width), 0);

    const bbox: TextLayoutBBox = {
      xOffset: 0,
      yOffset: 0,
      width: bboxWH[0],
      height: bboxWH[1]
    };

    this.LayoutBBox(bbox, textAlign, textBaseline, linesLayout);

    return this.layoutWithBBox(bbox, linesLayout, textAlign, textBaseline, lineHeight);
  }

  /**
   * 给定了bbox，使用拆分好的每行字符串进行布局
   * @param bbox
   * @param lines
   * @param textAlign
   * @param textBaseline
   * @param lineHeight
   * @returns
   */
  layoutWithBBox(
    bbox: TextLayoutBBox,
    lines: LayoutItemType[],
    textAlign: TextAlignType,
    textBaseline: TextBaselineType,
    lineHeight: number
  ): LayoutType {
    const origin: vec2 = [0, 0];
    const totalLineHeight = lines.length * lineHeight; // 总高度
    // origin在y方向需要初始化，然后递增即可
    if (textBaseline === 'top') {
      // origin[1] = 0;
    } else if (textBaseline === 'middle') {
      origin[1] = (bbox.height - totalLineHeight) / 2;
    } else if (textBaseline === 'bottom') {
      origin[1] = bbox.height - totalLineHeight;
    }

    for (let i = 0; i < lines.length; i++) {
      this.lineOffset(bbox, lines[i], textAlign, textBaseline, lineHeight, origin);
    }

    return {
      bbox,
      lines,
      fontFamily: this.fontFamily,
      fontSize: this.textOptions.fontSize,
      fontWeight: this.textOptions.fontWeight,
      lineHeight,
      textAlign,
      textBaseline
    };
  }

  /**
   * 计算line在bbox中的位置，需要配合layoutWithBBox使用
   * @param bbox
   * @param line
   * @param textAlign
   * @param textBaseline
   * @param lineHeight
   * @param origin 这个line的左上角位置，会复用并修改
   */
  private lineOffset(
    bbox: TextLayoutBBox,
    line: LayoutItemType,
    textAlign: TextAlignType,
    textBaseline: TextBaselineType,
    lineHeight: number,
    origin: vec2
  ): LayoutItemType {
    if (textAlign === 'left' || textAlign === 'start') {
      line.leftOffset = 0;
    } else if (textAlign === 'center') {
      line.leftOffset = (bbox.width - line.width) / 2;
    } else if (textAlign === 'right' || textAlign === 'end') {
      line.leftOffset = bbox.width - line.width;
    }

    line.topOffset = lineHeight / 2 + (line.ascent - line.descent) / 2 + origin[1];

    // 在行内进行偏移
    if (!line.keepCenterInLine) {
      const actualHeight = line.ascent + line.descent;
      const buf = 0;
      const actualHeightWithBuf = actualHeight + buf;
      if (actualHeightWithBuf < lineHeight - buf) {
        if (textBaseline === 'bottom') {
          line.topOffset += (lineHeight - actualHeightWithBuf) / 2;
        } else if (textBaseline === 'top') {
          line.topOffset -= (lineHeight - actualHeightWithBuf) / 2;
        }
      }
      if (textBaseline === 'alphabetic') {
        const fontBoundingHeight = line.ascent + line.descent;
        const ratio = lineHeight / fontBoundingHeight;
        line.topOffset = lineHeight / 2 + ((line.ascent - line.descent) / 2) * ratio + origin[1];
      }
    }

    origin[1] += lineHeight;

    return line;
  }
}
