import { injectable } from '../../../common/inversify-lite';
import type { IGraphicUtil } from '../../../interface/core';
import type { ICanvas, IContext2d, EnvType } from '../../../interface';
import type { TextOptionsType, ITextMeasure } from '../../../interface/text';
import { DefaultTextAttribute, DefaultTextStyle } from '../../../graphic/config';
import { testLetter } from '../../../graphic/richtext/utils';

@injectable()
export class ATextMeasure implements ITextMeasure {
  release: (...params: any) => void;
  protected canvas?: ICanvas;
  protected context?: IContext2d | null;

  configure(service: IGraphicUtil, env: EnvType): void {
    this.canvas = service.canvas;
    this.context = service.context;
    service.bindTextMeasure(this);
  }

  /**
   * 获取text宽度，measureText.width
   * @param text
   * @param options
   */
  measureTextWidth(text: string, options: TextOptionsType): number {
    if (!this.context) {
      return this.estimate(text, options).width;
    }
    this.context.setTextStyleWithoutAlignBaseline(options);
    const textMeasure = this.context.measureText(text);
    return textMeasure.width;
  }

  // 估算文字长度
  estimate(
    text: string,
    { fontSize = DefaultTextAttribute.fontSize }: TextOptionsType
  ): { width: number; height: number } {
    // 假设只有英文和中文字符
    let eCharLen = 0; // 英文字符
    let cCharLen = 0; // 中文字符
    // 判断ascii码，如果是
    for (let i = 0; i < text.length; i++) {
      text.charCodeAt(i) < 128 ? eCharLen++ : cCharLen++;
    }
    return {
      width: ~~(0.8 * eCharLen * fontSize + cCharLen * fontSize),
      height: fontSize
    };
  }

  /**
   * 获取text像素高度，基于actualBoundingBoxAscent和actualBoundingBoxDescent
   * @param text
   * @param options
   */
  measureTextPixelHeight(text: string, options: TextOptionsType): number {
    if (!this.context) {
      return options.fontSize ?? DefaultTextStyle.fontSize;
    }
    this.context.setTextStyleWithoutAlignBaseline(options);
    const textMeasure = this.context.measureText(text);
    return Math.abs((textMeasure as any).actualBoundingBoxAscent - (textMeasure as any).actualBoundingBoxDescent);
  }

  /**
   * 获取text包围盒的高度，基于fontBoundingBoxAscent和fontBoundingBoxDescent
   * @param text
   * @param options
   */
  measureTextBoundHieght(text: string, options: TextOptionsType): number {
    if (!this.context) {
      return options.fontSize ?? DefaultTextStyle.fontSize;
    }
    this.context.setTextStyleWithoutAlignBaseline(options);
    const textMeasure = this.context.measureText(text);
    return Math.abs((textMeasure as any).fontBoundingBoxAscent - (textMeasure as any).fontBoundingBoxDescent);
  }

  /**
   * 获取text测量对象
   * @param text
   * @param options
   */
  measureText(text: string, options: TextOptionsType): TextMetrics | { width: number } {
    if (!this.context) {
      return this.estimate(text, options);
    }
    this.context.setTextStyleWithoutAlignBaseline(options);
    return this.context.measureText(text);
  }

  clipTextVertical(
    verticalList: { text: string; width?: number; direction: number }[],
    options: TextOptionsType,
    width: number,
    wordBreak: boolean
  ): {
    verticalList: { text: string; width?: number; direction: number }[];
    width: number;
  } {
    if (verticalList.length === 0) {
      return { verticalList, width: 0 };
    }
    const { fontSize = 12 } = options;
    // 计算每一个区域的width
    verticalList.forEach(item => {
      item.width = item.direction === 0 ? fontSize : this.measureTextWidth(item.text, options);
    });
    const out: { text: string; width?: number; direction: number }[] = [];
    let length = 0;
    let i = 0;
    for (; i < verticalList.length; i++) {
      if (length + verticalList[i].width < width) {
        length += verticalList[i].width;
        out.push(verticalList[i]);
      } else {
        break;
      }
    }
    if (verticalList[i] && verticalList[i].text.length > 1) {
      const clipedData = this._clipText(
        verticalList[i].text,
        options,
        width - length,
        0,
        verticalList[i].text.length - 1
      );
      if (wordBreak && clipedData.str !== verticalList[i].text) {
        let text = '';
        let length = 0;
        for (let j = 0; j < i; j++) {
          const item = verticalList[j];
          text += item.text;
          length += item.text.length;
        }
        text += verticalList[i].text;
        const totalLength = length + clipedData.str.length;
        let index = testLetter(text, totalLength);
        index = index - length;
        if (index !== clipedData.str.length - 1) {
          clipedData.str = clipedData.str.substring(0, index);
          clipedData.width = this.measureTextWidth(clipedData.str, options);
        }
      }
      out.push({ ...verticalList[i], text: clipedData.str, width: clipedData.width });
      length += clipedData.width;
    }

    return {
      verticalList: out,
      width: length
    };
  }

  /**
   * 将文本裁剪到width宽
   * @param text
   * @param options
   * @param width
   */
  clipText(
    text: string,
    options: TextOptionsType,
    width: number,
    wordBreak: boolean
  ): {
    str: string;
    width: number;
  } {
    if (text.length === 0) {
      return { str: '', width: 0 };
    }
    let length = this.measureTextWidth(text, options);
    if (length <= width) {
      return { str: text, width: length };
    }
    length = this.measureTextWidth(text[0], options);
    if (length > width) {
      return { str: '', width: 0 };
    }
    const data = this._clipText(text, options, width, 0, text.length - 1);
    // 如果需要文字截断
    if (wordBreak && data.str !== text) {
      const index = testLetter(text, data.str.length);
      if (index !== data.str.length) {
        data.str = text.substring(0, index);
        data.width = this.measureTextWidth(data.str, options);
      }
    }
    return data;
  }

  // 二分法找到最佳宽
  private _clipText(
    text: string,
    options: TextOptionsType,
    width: number,
    leftIdx: number,
    rightIdx: number
  ): { str: string; width: number } {
    const middleIdx = Math.floor((leftIdx + rightIdx) / 2);
    const subText = text.substring(0, middleIdx + 1);
    const strWidth = this.measureTextWidth(subText, options);
    let length: number;
    if (strWidth > width) {
      // 如果字符串的宽度大于限制宽度
      if (subText.length <= 1) {
        return { str: '', width: 0 };
      } // 如果子字符串长度小于1，而且大于给定宽的话，返回空字符串
      // 先判断是不是左侧的那个字符
      const str = text.substring(0, middleIdx);
      // 如果到左侧的字符小于或等于width，那么说明就是左侧的字符
      length = this.measureTextWidth(str, options);
      if (length <= width) {
        return { str, width: length };
      }
      // 返回leftIdx到middleIdx
      return this._clipText(text, options, width, leftIdx, middleIdx);
    } else if (strWidth < width) {
      // 如果字符串的宽度小于限制宽度
      if (middleIdx >= text.length - 1) {
        return { str: text, width: this.measureTextWidth(text, options) };
      } // 如果已经到结尾了，返回text
      // 先判断是不是右侧的那个字符
      const str = text.substring(0, middleIdx + 2);
      // 如果到右侧的字符大于或等于width，那么说明就是这个字符串
      length = this.measureTextWidth(str, options);
      if (length >= width) {
        return { str: subText, width: strWidth };
      }
      // 返回middleIdx到rightIdx
      return this._clipText(text, options, width, middleIdx, rightIdx);
    }
    // 如果相同，那么就找到text
    return { str: subText, width: strWidth };
  }

  clipTextWithSuffixVertical(
    verticalList: { text: string; width?: number; direction: number }[],
    options: TextOptionsType,
    width: number,
    suffix: string,
    wordBreak: boolean
  ): {
    verticalList: { text: string; width?: number; direction: number }[];
    width: number;
  } {
    if (suffix === '') {
      return this.clipTextVertical(verticalList, options, width, wordBreak);
    }
    if (verticalList.length === 0) {
      return { verticalList, width: 0 };
    }

    const output = this.clipTextVertical(verticalList, options, width, wordBreak);
    if (
      output.verticalList.length === verticalList.length &&
      output.verticalList[output.verticalList.length - 1].width === verticalList[verticalList.length - 1].width
    ) {
      return output;
    }

    const suffixWidth = this.measureTextWidth(suffix, options);
    if (suffixWidth > width) {
      return output;
    }

    width -= suffixWidth;

    const out = this.clipTextVertical(verticalList, options, width, wordBreak);
    out.width += suffixWidth;
    out.verticalList.push({
      text: suffix,
      direction: 1,
      width: suffixWidth
    });
    return out;
  }
  clipTextWithSuffix(
    text: string,
    options: TextOptionsType,
    width: number,
    suffix: string,
    wordBreak: boolean
  ): {
    str: string;
    width: number;
  } {
    if (suffix === '') {
      return this.clipText(text, options, width, wordBreak);
    }
    if (text.length === 0) {
      return { str: '', width: 0 };
    }
    const length = this.measureTextWidth(text, options);
    if (length <= width) {
      return { str: text, width: length };
    }
    const suffixWidth = this.measureTextWidth(suffix, options);
    if (suffixWidth > width) {
      return { str: '', width: 0 };
    }
    width -= suffixWidth;
    const data = this._clipText(text, options, width, 0, text.length - 1);

    // 如果需要文字截断
    if (wordBreak && data.str !== text) {
      const index = testLetter(text, data.str.length);
      if (index !== data.str.length) {
        data.str = text.substring(0, index);
        data.width = this.measureTextWidth(data.str, options);
      }
    }
    data.str += suffix;
    data.width += suffixWidth;
    return data;
  }
}
