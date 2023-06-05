import { ITextMeasure, TextOptionsType } from './ITextMeasure';

type vec2 = [number, number];

export type TextAlignType = 'left' | 'right' | 'center' | 'start' | 'end';
export type TextBaselineType = 'top' | 'middle' | 'bottom' | 'alphabetic';

export interface LayoutItemType {
  str: string; // 这行的字符串
  leftOffset?: number; // 该行距离左侧的偏移
  topOffset?: number; // 该行距离右侧的偏移
  width: number;
}

export interface BBox {
  width: number; // 包围盒的宽度
  height: number; // 包围盒的高度
  xOffset: number;
  yOffset: number;
}

export interface LayoutType {
  bbox: BBox;
  lines: LayoutItemType[];
  fontFamily: string;
  fontSize: number;
  fontWeight?: string | number;
  lineHeight: number;
  textAlign: TextAlignType;
  textBaseline: TextBaselineType;
}
export interface SimplifyLayoutType {
  lines: LayoutItemType[];
}

export class CanvasTextLayout {
  private fontFamily: string;
  private textOptions: TextOptionsType;
  private textMeasure: ITextMeasure;

  constructor(fontFamily: string, options: TextOptionsType, textMeasure: ITextMeasure) {
    this.fontFamily = fontFamily;
    this.textOptions = options;
    this.textMeasure = textMeasure;
  }

  LayoutBBox(bbox: BBox, textAlign: TextAlignType, textBaseline: TextBaselineType): BBox {
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
    miniApp: boolean
  ): LayoutType {
    // 拆分str
    const linesLayout: LayoutItemType[] = [];
    // bbox高度可能大于totalHeight
    const bboxWH: vec2 = [width, height];
    const bboxOffset: vec2 = [0, 0];

    while (str.length > 0) {
      const { str: clipText } = this.textMeasure.clipTextWithSuffix(str, this.textOptions, width, suffix);
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

    const bbox: BBox = {
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
          str: this.textMeasure.clipTextWithSuffix(lines[i] as string, this.textOptions, width, suffix).str,
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

    const bbox: BBox = {
      xOffset: 0,
      yOffset: 0,
      width: bboxWH[0],
      height: bboxWH[1]
    };

    this.LayoutBBox(bbox, textAlign, textBaseline);

    return this.layoutWithBBox(bbox, linesLayout, textAlign, textBaseline, lineHeight);
  }

  layoutWithBBox(
    bbox: BBox,
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
    bbox: BBox,
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

    line.topOffset = lineHeight * 0.79 + origin[1]; // 渲染默认使用alphabetic
    origin[1] += lineHeight;

    return line;
  }
}
