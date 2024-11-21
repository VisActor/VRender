// import { IContext2d } from '../../IContext';
import type { IContext2d, IRichTextIcon } from '../../interface';
import { RichTextIcon } from './icon';
import Paragraph from './paragraph';
import { applyFillStyle, applyStrokeStyle, DIRECTION_KEY, measureTextCanvas, regFirstSpace } from './utils';

/**
 * 部分代码参考 https://github.com/danielearwicker/carota/
 * The MIT License (MIT)

  "Carota" - Copyright (c) 2013 Daniel Earwicker

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
 */

// 行
// 参考carota
// https://github.com/danielearwicker/carota/blob/master/src/line.js
export default class Line {
  left: number;
  top: number;
  width: number;
  height: number;
  baseline: number;
  ascent: number;
  descent: number;
  paragraphs: (Paragraph | RichTextIcon)[];
  actualWidth: number;
  blankWidth: number;
  textAlign: string;
  direction: 'horizontal' | 'vertical';
  directionKey: { width: string; height: string; left: string; x: string; y: string };

  constructor(
    left: number,
    width: number,
    baseline: number,
    ascent: number,
    descent: number,
    lineBuffer: (Paragraph | RichTextIcon)[],
    direction: 'horizontal' | 'vertical',
    isWidthMax: boolean
  ) {
    this.left = left;
    this.width = width;
    this.baseline = baseline;
    this.ascent = ascent;
    this.descent = descent;
    // this.height = ascent + descent;
    this.top = baseline - ascent;
    this.paragraphs = lineBuffer.map(p => p);
    this.textAlign =
      (this.paragraphs[0] instanceof RichTextIcon
        ? this.paragraphs[0].attribute.textAlign
        : this.paragraphs[0].character.textAlign) || 'left'; // 对齐方式选择第一个paragraph属性
    this.direction = direction;
    this.directionKey = DIRECTION_KEY[this.direction];

    this.actualWidth = 0;
    let maxHeight = 0;
    this.paragraphs.forEach((word, index) => {
      // 每行中第一个字符不能是空格
      if (index === 0 && word instanceof Paragraph) {
        const result = regFirstSpace.exec(word.text);
        if (result?.index !== 0) {
          word.text = word.text.slice(result?.index);
          word.updateWidth();
        }
      }
      this.actualWidth += word[this.directionKey.width];
      maxHeight = Math.max(word[this.directionKey.height], maxHeight);
    });
    this.height = maxHeight;

    this.blankWidth = !isWidthMax ? this.width - this.actualWidth : 0;

    this.calcOffset(width, isWidthMax);
  }

  calcOffset(width: number, isWidthMax: boolean) {
    // 处理对齐方式，计算左侧偏移距离和字符之间间距
    const directionKey = this.directionKey;
    const maxHeight = this.height;
    let x = this.left;
    let spacing = 0;
    if (this.actualWidth < width && !isWidthMax) {
      if (this.textAlign === 'right' || this.textAlign === 'end') {
        x = width - this.actualWidth;
      } else if (this.textAlign === 'center') {
        x = (width - this.actualWidth) / 2;
      } else if (this.textAlign === 'justify') {
        if (this.paragraphs.length < 2) {
          // 只有一个paragraph两端对齐居中显示
          x = (width - this.actualWidth) / 2;
        } else {
          spacing = (width - this.actualWidth) / (this.paragraphs.length - 1);
        }
      }
    }

    this.paragraphs.map(function (paragraph) {
      if (paragraph instanceof RichTextIcon) {
        // paragraph.setAttribute(directionKey.x, x);
        paragraph['_' + directionKey.x] = x;
        x += paragraph[directionKey.width] + spacing;
        // 处理纵向对齐
        paragraph['_' + directionKey.y] =
          paragraph.attribute.textBaseline === 'top'
            ? 0
            : paragraph.attribute.textBaseline === 'bottom'
            ? maxHeight - paragraph.height
            : (maxHeight - paragraph.height) / 2;
      } else {
        paragraph[directionKey.left] = x;
        x += paragraph[directionKey.width] + spacing;
      }
    });
  }

  draw(
    ctx: IContext2d,
    lastLine: boolean,
    x: number,
    y: number,
    drawEllipsis: boolean | string,
    drawIcon: (icon: IRichTextIcon, context: IContext2d, x: number, y: number, baseline: number) => void
  ) {
    if (drawEllipsis && (lastLine || this.paragraphs.some(p => (p as Paragraph).overflow))) {
      // 检测是否需要省略号，因为会有多行同时省略的情况
      let emptyOverflow = true;
      let skipEllipsis = false;
      for (let i = this.paragraphs.length - 1; i >= 0; i--) {
        const paragraph = this.paragraphs[i];
        if ((paragraph as Paragraph).overflow) {
          emptyOverflow = emptyOverflow && (paragraph as Paragraph).text === '';
        } else {
          if (emptyOverflow) {
            skipEllipsis = true;
            break;
          }
        }
      }

      // 处理省略号
      let otherParagraphWidth = 0;
      if (!skipEllipsis) {
        for (let i = this.paragraphs.length - 1; i >= 0; i--) {
          const paragraph = this.paragraphs[i];
          if ((paragraph as Paragraph).overflow) {
            if ((paragraph as Paragraph).text === '') {
              break;
            }
            continue;
          }
          if (paragraph instanceof RichTextIcon) {
            break; // todo: 处理最后为图标，显示省略号的情况
          }
          if (this.direction === 'vertical' && paragraph.direction !== 'vertical') {
            paragraph.verticalEllipsis = true;
            break;
          }
          const ellipsis = drawEllipsis === true ? '...' : drawEllipsis || '';
          paragraph.ellipsisStr = ellipsis;
          // const { width } = measureText('...', paragraph.style);
          const { width } = measureTextCanvas(ellipsis, paragraph.character);
          const ellipsisWidth = width || 0;
          if (ellipsisWidth <= this.blankWidth + otherParagraphWidth) {
            // 省略号可以直接接在后面paragraph
            lastLine && (paragraph.ellipsis = 'add');

            break;
          } else if (ellipsisWidth <= this.blankWidth + otherParagraphWidth + paragraph.width) {
            // 省略号需要替换paragraph中的字符
            paragraph.ellipsis = 'replace';
            paragraph.ellipsisWidth = ellipsisWidth;
            paragraph.ellipsisOtherParagraphWidth = this.blankWidth + otherParagraphWidth;

            break;
          } else {
            // 省略号需要的width大于paragraph的width，隐藏paragraph，向前搜索
            paragraph.ellipsis = 'hide';
            otherParagraphWidth += paragraph.width;
          }
        }
      }
    }

    // 正常绘制
    this.paragraphs.forEach((paragraph, index) => {
      if (paragraph instanceof RichTextIcon) {
        // 更新icon位置
        paragraph.setAttributes({
          x: x + paragraph._x,
          y: y + paragraph._y
        });

        // 绘制icon
        drawIcon(paragraph, ctx, x + paragraph._x, y + paragraph._y, this.ascent);
        return;
      }
      const b = {
        x1: this.left,
        y1: this.top,
        x2: this.left + this.actualWidth,
        y2: this.top + this.height
      };
      applyStrokeStyle(ctx, paragraph.character);
      // 下面绘制underline和line-through时需要设置FillStyle
      applyFillStyle(ctx, paragraph.character, b);
      paragraph.draw(ctx, y + this.ascent, x, index === 0, this.textAlign);
    });
  }

  getWidthWithEllips(ellipsis: string) {
    // 处理省略号
    let otherParagraphWidth = 0;
    for (let i = this.paragraphs.length - 1; i >= 0; i--) {
      const paragraph = this.paragraphs[i];
      if (paragraph instanceof RichTextIcon) {
        break; // todo: 处理最后为图标，显示省略号的情况
      }

      const { width } = measureTextCanvas(ellipsis, paragraph.character);
      const ellipsisWidth = width || 0;
      if (ellipsisWidth <= this.blankWidth + otherParagraphWidth) {
        // 省略号可以直接接在后面paragraph
        paragraph.ellipsis = 'add';
        paragraph.ellipsisWidth = ellipsisWidth;
        break;
      } else if (ellipsisWidth <= this.blankWidth + otherParagraphWidth + paragraph.width) {
        // 省略号需要替换paragraph中的字符
        paragraph.ellipsis = 'replace';
        paragraph.ellipsisWidth = ellipsisWidth;
        paragraph.ellipsisOtherParagraphWidth = this.blankWidth + otherParagraphWidth;

        break;
      } else {
        // 省略号需要的width大于paragraph的width，隐藏paragraph，向前搜索
        paragraph.ellipsis = 'hide';
        otherParagraphWidth += paragraph.width;
      }
    }

    let width = 0;
    // 正常绘制
    this.paragraphs.forEach((paragraph, index) => {
      if (paragraph instanceof RichTextIcon) {
        width += paragraph.width; // todo: 处理direction
      } else {
        width += paragraph.getWidthWithEllips(this.direction);
      }
    });

    return width;
  }
}
