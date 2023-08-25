import type { vec2 } from '@visactor/vutils';
import type { ITextMeasure, TextOptionsType } from '../../../interface/text';
import type { TextLayoutBBox, LayoutItemType, LayoutType, TextAlignType, TextBaselineType } from '../../../interface';

export class CanvasTextLayout {
  private fontFamily: string;
  private textOptions: TextOptionsType;
  private textMeasure: ITextMeasure;

  constructor(fontFamily: string, options: TextOptionsType, textMeasure: ITextMeasure) {
    this.fontFamily = fontFamily;
    this.textOptions = options;
    this.textMeasure = textMeasure;
  }

  LayoutBBox(bbox: TextLayoutBBox, textAlign: TextAlignType, textBaseline: TextBaselineType): TextLayoutBBox {
    if (textAlign === 'left' || textAlign === 'start') {
      bbox.xOffset = 0;
    } else if (textAlign === 'center') {
      bbox.xOffset = bbox.width / -2;
    } else if (textAlign === 'right' || textAlign === 'end') {
      bbox.xOffset = -bbox.width;
    } else {
      throw new Error('非法的textAlign');
    }

    if (textBaseline === 'top') {
      bbox.yOffset = 0;
    } else if (textBaseline === 'middle') {
      bbox.yOffset = bbox.height / -2;
    } else if (textBaseline === 'alphabetic') {
      bbox.yOffset = bbox.height * -0.79;
    } else {
      bbox.yOffset = -bbox.height;
    }

    return bbox;
  }

  GetLayout(
    str: string,
    width: number,
    height: number,
    textAlign: TextAlignType,
    textBaseline: TextBaselineType,
    lineHeight: number,
    suffix: string,
    wordBreak: boolean,
    miniApp: boolean
  ): LayoutType {
    // 拆分str
    const linesLayout: LayoutItemType[] = [];
    // bbox高度可能大于totalHeight
    const bboxWH: vec2 = [width, height];
    const bboxOffset: vec2 = [0, 0];

    while (str.length > 0) {
      const { str: clipText } = this.textMeasure.clipTextWithSuffix(str, this.textOptions, width, suffix, wordBreak);
      linesLayout.push({
        str: clipText,
        width: this.textMeasure.measureTextWidth(clipText, this.textOptions)
      });
      str = str.substring(clipText.length);
    }

    if (textAlign === 'left' || textAlign === 'start') {
      // origin[0] = 0;
    } else if (textAlign === 'center') {
      bboxOffset[0] = bboxWH[0] / -2;
    } else if (textAlign === 'right' || textAlign === 'end') {
      bboxOffset[0] = -bboxWH[0];
    }

    if (textBaseline === 'top') {
      // origin[1] = 0;
    } else if (textBaseline === 'middle') {
      bboxOffset[1] = bboxWH[1] / -2;
    } else if (textBaseline === 'bottom') {
      bboxOffset[1] = -bboxWH[1];
    }

    const bbox: TextLayoutBBox = {
      xOffset: bboxOffset[0],
      yOffset: bboxOffset[1],
      width: bboxWH[0],
      height: bboxWH[1]
    };

    return this.layoutWithBBox(bbox, linesLayout, textAlign, textBaseline, lineHeight);
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
    lineWidth?: number
  ): LayoutType {
    lines = lines.map(l => l.toString()) as string[];
    const linesLayout: LayoutItemType[] = [];
    // bbox高度可能大于totalHeight
    const bboxWH: vec2 = [0, 0];
    if (typeof lineWidth === 'number' && lineWidth !== Infinity) {
      // 直接使用lineWidth，并拆分字符串
      let width: number;
      for (let i = 0, len = lines.length; i < len; i++) {
        width = Math.min(this.textMeasure.measureTextWidth(lines[i] as string, this.textOptions), lineWidth);
        linesLayout.push({
          str: this.textMeasure.clipTextWithSuffix(lines[i] as string, this.textOptions, width, suffix, wordBreak).str,
          width
        });
      }
      bboxWH[0] = lineWidth;
    } else {
      // 使用所有行中最长的作为lineWidth
      lineWidth = 0;
      let width: number;
      let text: string;
      for (let i = 0, len = lines.length; i < len; i++) {
        text = lines[i] as string;
        width = this.textMeasure.measureTextWidth(text, this.textOptions);
        lineWidth = Math.max(lineWidth, width);
        linesLayout.push({ str: text, width });
      }
      bboxWH[0] = lineWidth;
    }
    bboxWH[1] = linesLayout.length * lineHeight;

    bboxWH[0] = linesLayout.reduce((a, b) => Math.max(a, b.width), 0);

    const bbox: TextLayoutBBox = {
      xOffset: 0,
      yOffset: 0,
      width: bboxWH[0],
      height: bboxWH[1]
    };

    this.LayoutBBox(bbox, textAlign, textBaseline);

    return this.layoutWithBBox(bbox, linesLayout, textAlign, textBaseline, lineHeight);
  }

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

    // line.topOffset = lineHeight * 0.79 + origin[1]; // 渲染默认使用alphabetic
    line.topOffset = (lineHeight - this.textOptions.fontSize) / 2 + this.textOptions.fontSize * 0.79 + origin[1];
    origin[1] += lineHeight;

    return line;
  }
}
