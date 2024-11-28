import { injectable } from '../../../common/inversify-lite';
import type { IGraphicUtil } from '../../../interface/core';
import type { ICanvas, IContext2d, EnvType } from '../../../interface';
import { MeasureModeEnum } from '../../../interface';
import type { TextOptionsType, ITextMeasure } from '../../../interface/text';
import { DefaultTextAttribute, DefaultTextStyle } from '../../../graphic/config';
import { testLetter } from '../../../graphic/richtext/utils';
import { Logger } from '@visactor/vutils';

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

  protected _measureTextWithoutAlignBaseline(text: string, options: TextOptionsType, compatible?: boolean) {
    this.context.setTextStyleWithoutAlignBaseline(options);
    const metrics = this.context.measureText(text);

    return compatible ? this.compatibleMetrics(metrics, options) : metrics;
  }

  protected _measureTextWithAlignBaseline(text: string, options: TextOptionsType, compatible?: boolean) {
    this.context.setTextStyle(options);
    const metrics = this.context.measureText(text);

    return compatible ? this.compatibleMetrics(metrics, options) : metrics;
  }

  protected compatibleMetrics(metrics: TextMetrics | { width: number }, options: TextOptionsType) {
    if (
      (metrics as any).actualBoundingBoxAscent == null ||
      (metrics as any).actualBoundingBoxDescent == null ||
      (metrics as any).fontBoundingBoxAscent == null ||
      (metrics as any).fontBoundingBoxDescent == null
    ) {
      const { ascent, descent } = this.measureTextBoundADscentEstimate(options);
      (metrics as any).actualBoundingBoxAscent = ascent;
      (metrics as any).actualBoundingBoxDescent = descent;
      (metrics as any).fontBoundingBoxAscent = ascent;
      (metrics as any).fontBoundingBoxDescent = descent;
    }
    if ((metrics as any).actualBoundingBoxLeft == null || (metrics as any).actualBoundingBoxRight == null) {
      const { left, right } = this.measureTextBoundLeftRightEstimate(options);
      (metrics as any).actualBoundingBoxLeft = left;
      (metrics as any).actualBoundingBoxRight = right;
    }
    return metrics;
  }

  // 估算文字长度
  protected estimate(
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
   * 获取text宽度，measureText.width
   * @param text
   * @param options
   */
  measureTextWidth(text: string, options: TextOptionsType, textMeasure?: TextMetrics | { width: number }): number {
    if (!this.context) {
      return this.estimate(text, options).width;
    }
    textMeasure = textMeasure ?? this._measureTextWithoutAlignBaseline(text, options);
    return textMeasure.width;
  }
  /**
   * 获取text宽度，measureText.width
   * @param text
   * @param options
   */
  measureTextBoundsWidth(
    text: string,
    options: TextOptionsType,
    textMeasure?: TextMetrics | { width: number }
  ): number {
    if (!this.context) {
      return this.estimate(text, options).width;
    }
    textMeasure = textMeasure ?? this._measureTextWithoutAlignBaseline(text, options);
    return textMeasure.width;
  }

  measureTextBoundsLeftRight(text: string, options: TextOptionsType, textMeasure?: TextMetrics | { width: number }) {
    if (!this.context) {
      return this.measureTextBoundLeftRightEstimate(options);
    }
    textMeasure = textMeasure ?? this._measureTextWithAlignBaseline(text, options, true);
    return {
      left: (textMeasure as any).actualBoundingBoxLeft,
      right: (textMeasure as any).actualBoundingBoxRight
    };
  }

  /**
   * 获取text像素高度，基于actualBoundingBoxAscent和actualBoundingBoxDescent
   * @param text
   * @param options
   */
  measureTextPixelHeight(
    text: string,
    options: TextOptionsType,
    textMeasure?: TextMetrics | { width: number }
  ): number {
    if (!this.context) {
      return options.fontSize ?? DefaultTextStyle.fontSize;
    }
    textMeasure = textMeasure ?? this._measureTextWithoutAlignBaseline(text, options, true);
    return Math.abs((textMeasure as any).actualBoundingBoxAscent - (textMeasure as any).actualBoundingBoxDescent);
  }

  measureTextPixelADscent(text: string, options: TextOptionsType, textMeasure?: TextMetrics | { width: number }) {
    if (!this.context) {
      return this.measureTextBoundADscentEstimate(options);
    }
    textMeasure = textMeasure ?? this._measureTextWithAlignBaseline(text, options, true);
    return {
      ascent: (textMeasure as any).actualBoundingBoxAscent,
      descent: (textMeasure as any).actualBoundingBoxDescent
    };
  }

  /**
   * 获取text包围盒的高度，基于fontBoundingBoxAscent和fontBoundingBoxDescent
   * @param text
   * @param options
   */
  measureTextBoundHieght(
    text: string,
    options: TextOptionsType,
    textMeasure?: TextMetrics | { width: number }
  ): number {
    if (!this.context) {
      return options.fontSize ?? DefaultTextStyle.fontSize;
    }
    textMeasure = textMeasure ?? this._measureTextWithoutAlignBaseline(text, options, true);
    return Math.abs((textMeasure as any).fontBoundingBoxAscent - (textMeasure as any).fontBoundingBoxDescent);
  }

  measureTextBoundADscent(text: string, options: TextOptionsType, textMeasure?: TextMetrics | { width: number }) {
    if (!this.context) {
      return this.measureTextBoundADscentEstimate(options);
    }
    textMeasure = textMeasure ?? this._measureTextWithAlignBaseline(text, options, true);
    return {
      ascent: (textMeasure as any).fontBoundingBoxAscent,
      descent: (textMeasure as any).fontBoundingBoxDescent
    };
  }

  protected measureTextBoundADscentEstimate(options: TextOptionsType) {
    const fontSize = options.fontSize ?? DefaultTextStyle.fontSize;
    return {
      ascent: 0.79 * fontSize,
      descent: 0.21 * fontSize
    };
    // const { textBaseline } = options;
    // if (textBaseline === 'bottom') {
    //   return {
    //     ascent: fontSize,
    //     descent: 0
    //   };
    // } else if (textBaseline === 'middle') {
    //   return {
    //     ascent: fontSize / 2,
    //     descent: fontSize / 2
    //   };
    // } else if (textBaseline === 'alphabetic') {
    //   return {
    //     ascent: 0.79 * fontSize,
    //     descent: 0.21 * fontSize
    //   };
    // }

    // return {
    //   ascent: 0,
    //   descent: fontSize
    // };
  }

  protected measureTextBoundLeftRightEstimate(options: TextOptionsType) {
    const fontSize = options.fontSize ?? DefaultTextStyle.fontSize;
    const { textAlign } = options;

    if (textAlign === 'center') {
      return {
        left: fontSize / 2,
        right: fontSize / 2
      };
    } else if (textAlign === 'right' || textAlign === 'end') {
      return {
        left: fontSize,
        right: 0
      };
    }
    return {
      left: 0,
      right: fontSize
    };
  }

  measureTextPixelADscentAndWidth(
    text: string,
    options: TextOptionsType,
    mode: MeasureModeEnum
  ): { width: number; ascent: number; descent: number } {
    if (!this.context) {
      return {
        ...this.measureTextBoundADscentEstimate(options),
        width: this.estimate(text, options).width
      };
    }
    const out = this._measureTextWithoutAlignBaseline(text, options, true);

    if (mode === MeasureModeEnum.actualBounding) {
      return {
        ascent: (out as any).actualBoundingBoxAscent,
        descent: (out as any).actualBoundingBoxDescent,
        width: (out as any).width
      };
    } else if (mode === MeasureModeEnum.estimate) {
      return {
        ...this.measureTextBoundADscentEstimate(options),
        width: (out as any).width
      };
    } else if (mode === MeasureModeEnum.fontBounding) {
      // const { lineHeight = options.fontSize } = options;
      // let ratio = 1;
      // if (lineHeight) {
      //   const fontBoundingHeight = (out as any).fontBoundingBoxAscent + (out as any).fontBoundingBoxDescent;
      //   ratio = lineHeight / fontBoundingHeight;
      // }
      // 避免二次矫正，应当保证所有字符组合的基线都一样，否则fontBounding就失去意义了
      // 但如果超出边界了，就只能进行二次矫正
      let ascent = (out as any).fontBoundingBoxAscent;
      let descent = (out as any).fontBoundingBoxDescent;
      // 只能一边超出，都超出的话目前无法矫正，因为行高不能超
      if ((out as any).actualBoundingBoxDescent && descent < (out as any).actualBoundingBoxDescent) {
        const delta = (out as any).actualBoundingBoxDescent - descent;
        descent += delta;
        ascent -= delta;
      } else if ((out as any).actualBoundingBoxAscent && ascent < (out as any).actualBoundingBoxAscent) {
        const delta = (out as any).actualBoundingBoxAscent - ascent;
        ascent += delta;
        descent -= delta;
      }
      return {
        ascent,
        descent,
        width: (out as any).width
      };
    }
    return {
      ascent: (out as any).actualBoundingBoxAscent,
      descent: (out as any).actualBoundingBoxDescent,
      width: (out as any).width
    };
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
        verticalList[i].text.length - 1,
        'end',
        false
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
    wordBreak: boolean,
    keepAllBreak?: boolean
  ): {
    str: string;
    width: number;
    wordBreaked?: number;
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
    const data = this._clipText(text, options, width, 0, text.length - 1, 'end', false);
    // 如果需要文字截断
    if (wordBreak && data.str !== text) {
      let index = testLetter(text, data.str.length, keepAllBreak);
      if (index !== data.str.length) {
        if (index > data.str.length) {
          (data as any).wordBreaked = index;
          index = data.str.length;
        }
        data.str = text.substring(0, index);
        data.width = this.measureTextWidth(data.str, options);
      }
    }
    return data;
  }

  // 二分法找到最佳宽
  // TODO: 后续考虑代码合并
  private _clipText(
    text: string,
    options: TextOptionsType,
    width: number,
    leftIdx: number,
    rightIdx: number,
    position: 'start' | 'end' | 'middle',
    suffix: string | false
  ): { str: string; width: number; result?: string } {
    let data: { str: string; width: number; result?: string };
    if (position === 'start') {
      data = this._clipTextStart(text, options, width, leftIdx, rightIdx);
      suffix && (data.result = suffix + data.str);
    } else if (position === 'middle') {
      const d = this._clipTextMiddle(text, options, width, '', '', 0, 0, 1);
      data = { str: 'none', width: d.width, result: d.left + suffix + d.right };
    } else {
      data = this._clipTextEnd(text, options, width, leftIdx, rightIdx);
      suffix && (data.result = data.str + suffix);
    }
    return data;
  }

  private _clipTextEnd(
    text: string,
    options: TextOptionsType,
    width: number,
    leftIdx: number,
    rightIdx: number
  ): { str: string; width: number } {
    // 添加退出条件，如果leftIdx和rightIdx相等，那么就返回这个字符串（理论上这时出问题了）
    if (leftIdx === rightIdx) {
      Logger.getInstance().warn(`【_clipTextEnd】不应该走到这里${text}, ${leftIdx}, ${rightIdx}`);
      // console.warn(`【_clipTextEnd】不应该走到这里${text}, ${leftIdx}, ${rightIdx}`);
      const subText = text.substring(0, rightIdx + 1);
      return { str: subText, width: this.measureTextWidth(subText, options) };
    }
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
      return this._clipTextEnd(text, options, width, leftIdx, middleIdx);
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
      return this._clipTextEnd(text, options, width, middleIdx, rightIdx);
    }
    // 如果相同，那么就找到text
    return { str: subText, width: strWidth };
  }

  private _clipTextStart(
    text: string,
    options: TextOptionsType,
    width: number,
    leftIdx: number,
    rightIdx: number
  ): { str: string; width: number } {
    const middleIdx = Math.ceil((leftIdx + rightIdx) / 2);
    const subText = text.substring(middleIdx - 1, text.length);
    const strWidth = this.measureTextWidth(subText, options);
    let length: number;
    if (strWidth > width) {
      // 如果字符串的宽度大于限制宽度
      if (subText.length <= 1) {
        return { str: '', width: 0 };
      } // 如果子字符串长度小于1，而且大于给定宽的话，返回空字符串
      // 先判断是不是左侧的那个字符
      const str = text.substring(middleIdx, text.length);
      // 如果到左侧的字符小于或等于width，那么说明就是左侧的字符
      length = this.measureTextWidth(str, options);
      if (length <= width) {
        return { str, width: length };
      }
      // 返回leftIdx到middleIdx
      return this._clipTextStart(text, options, width, middleIdx, text.length);
    } else if (strWidth < width) {
      // 如果字符串的宽度小于限制宽度
      if (middleIdx <= 0) {
        return { str: text, width: this.measureTextWidth(text, options) };
      } // 如果已经到结尾了，返回text
      // 先判断是不是右侧的那个字符
      const str = text.substring(middleIdx - 2, text.length);
      // 如果到右侧的字符大于或等于width，那么说明就是这个字符串
      length = this.measureTextWidth(str, options);
      if (length >= width) {
        return { str: subText, width: strWidth };
      }
      // 返回middleIdx到rightIdx
      return this._clipTextStart(text, options, width, leftIdx, middleIdx);
    }
    // 如果相同，那么就找到text
    return { str: subText, width: strWidth };
  }

  private _clipTextMiddle(
    text: string,
    options: TextOptionsType,
    width: number,
    left: string,
    right: string,
    leftW: number,
    rightW: number,
    buffer: number
  ): { left: string; right: string; width: number } {
    const subLeftText = text.substring(0, buffer);
    const strLeftWidth = this.measureTextWidth(subLeftText, options);
    if (strLeftWidth + rightW > width) {
      return { left, right, width: leftW + rightW };
    }
    const subRightText = text.substring(text.length - buffer, text.length);
    const strRightWidth = this.measureTextWidth(subRightText, options);
    if (strLeftWidth + strRightWidth > width) {
      return { left: subLeftText, right, width: strLeftWidth + rightW };
    }
    return this._clipTextMiddle(
      text,
      options,
      width,
      subLeftText,
      subRightText,
      strLeftWidth,
      strRightWidth,
      buffer + 1
    );
  }

  clipTextWithSuffixVertical(
    verticalList: { text: string; width?: number; direction: number }[],
    options: TextOptionsType,
    width: number,
    suffix: string,
    wordBreak: boolean,
    suffixPosition: 'start' | 'end' | 'middle'
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

    let out;
    if (suffixPosition === 'start') {
      const nextVerticalList = this.revertVerticalList(verticalList);
      out = this.clipTextVertical(nextVerticalList, options, width, wordBreak);
      const v = this.revertVerticalList(out.verticalList);
      v.unshift({
        text: suffix,
        direction: 1,
        width: suffixWidth
      });
      out.verticalList = v;
    } else if (suffixPosition === 'middle') {
      const leftOut = this.clipTextVertical(verticalList, options, width / 2, wordBreak);
      const nextVerticalList = this.revertVerticalList(verticalList);
      const rightOut = this.clipTextVertical(nextVerticalList, options, width / 2, wordBreak);
      // 添加suffix
      leftOut.verticalList.push({
        text: suffix,
        direction: 1,
        width: suffixWidth
      });
      this.revertVerticalList(rightOut.verticalList).forEach(v => leftOut.verticalList.push(v));
      out = {
        verticalList: leftOut.verticalList,
        width: leftOut.width + rightOut.width
      };
    } else {
      out = this.clipTextVertical(verticalList, options, width, wordBreak);
      out.verticalList.push({
        text: suffix,
        direction: 1,
        width: suffixWidth
      });
    }
    out.width += suffixWidth;
    return out;
  }

  revertVerticalList(
    verticalList: {
      text: string;
      width?: number;
      direction: number;
    }[]
  ) {
    return verticalList.reverse().map(l => {
      const t = l.text.split('').reverse().join('');
      return {
        ...l,
        text: t
      };
    });
  }

  clipTextWithSuffix(
    text: string,
    options: TextOptionsType,
    width: number,
    suffix: string,
    wordBreak: boolean,
    position: 'start' | 'end' | 'middle',
    forceSuffix: boolean = false
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
    if (!forceSuffix && length <= width) {
      return { str: text, width: length };
    }
    const suffixWidth = this.measureTextWidth(suffix, options);
    if (suffixWidth > width) {
      return { str: '', width: 0 };
    }
    if (forceSuffix && length + suffixWidth <= width) {
      return { str: text + suffix, width: length + suffixWidth };
    }
    width -= suffixWidth;
    const data = this._clipText(text, options, width, 0, text.length - 1, position, suffix);

    // 如果需要文字截断
    if (wordBreak && data.str !== text) {
      const index = testLetter(text, data.str.length);
      if (index !== data.str.length) {
        data.result = text.substring(0, index);
        data.width = this.measureTextWidth(data.str, options);
      }
    } else if (forceSuffix && data.str === text) {
      data.result = text + suffix;
    }
    data.str = data.result!;
    data.width += suffixWidth;
    return data;
  }
}
