import Line from './line';
import type Frame from './frame';
import type Paragraph from './paragraph';
import { seperateParagraph } from './paragraph';
import { DIRECTION_KEY, getStrByWithCanvas } from './utils';
import { RichTextIcon } from './icon';

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

// 布局器
// 参考carota
// https://github.com/danielearwicker/carota/blob/master/src/wrap.js
export default class Wrapper {
  frame: Frame;

  lineWidth: number;
  width: number;
  height: number;
  y: number;
  maxAscent: number;
  maxDescent: number;
  maxAscentForBlank: number;
  maxDescentForBlank: number;
  lineBuffer: (Paragraph | RichTextIcon)[];
  direction: 'horizontal' | 'vertical';
  directionKey: { width: string; height: string };

  constructor(frame: Frame) {
    this.frame = frame;
    this.width = this.frame.width;
    this.height = this.frame.height;

    this.lineWidth = 0;
    this.y = this.frame.top;
    this.maxAscent = 0;
    this.maxDescent = 0;
    // 空字符串测量出的Ascent和Descent和文字不一致（空字符串测量结果ascent和descent一半一半），需要特殊处理
    this.maxAscentForBlank = 0;
    this.maxDescentForBlank = 0;
    this.lineBuffer = [];

    this.direction = frame.layoutDirection;
    this.directionKey = DIRECTION_KEY[this.direction];
  }

  // 不满一行，存储
  store(paragraph: Paragraph | RichTextIcon) {
    if (paragraph instanceof RichTextIcon) {
      this.frame.icons.set(paragraph.richtextId, paragraph);
      this.lineBuffer.push(paragraph);
      this.lineWidth += paragraph[this.directionKey.width];

      // 处理icon textBaseline ascent descent
      let iconAscent = 0;
      let iconDescent = 0;
      if (paragraph.attribute.textBaseline === 'top') {
        iconAscent = 0;
        iconDescent = paragraph.height;
      } else if (paragraph.attribute.textBaseline === 'bottom') {
        iconAscent = paragraph.height;
        iconDescent = 0;
      } else {
        iconAscent = paragraph.height / 2;
        iconDescent = paragraph.height / 2;
      }
      this.maxAscent = Math.max(this.maxAscent, iconAscent);
      this.maxDescent = Math.max(this.maxDescent, iconDescent);
    } else {
      this.lineBuffer.push(paragraph);
      if (paragraph.text.length !== 0) {
        this.lineWidth += paragraph[this.directionKey.width];
        this.maxAscent = Math.max(this.maxAscent, paragraph.ascent);
        this.maxDescent = Math.max(this.maxDescent, paragraph.descent);
      } else {
        this.maxAscentForBlank = Math.max(this.maxAscentForBlank, paragraph.ascent);
        this.maxDescentForBlank = Math.max(this.maxDescentForBlank, paragraph.descent);
      }
    }
  }

  // 满一行，生成line
  send() {
    if (this.lineBuffer.length === 0) {
      return;
    }
    // 当一行中有文字和空白时，不考虑空白的ascent和descent；如果只有空白（\n引起的空行），取空白部分的ascent和descent
    const maxAscent = this.maxAscent === 0 ? this.maxAscentForBlank : this.maxAscent;
    const maxDescent = this.maxDescent === 0 ? this.maxDescentForBlank : this.maxDescent;
    const line = new Line(
      this.frame.left,
      this[this.directionKey.width],
      this.y + maxAscent,
      maxAscent,
      maxDescent,
      this.lineBuffer,
      this.direction,
      this.direction === 'horizontal' ? this.frame.isWidthMax : this.frame.isHeightMax
    );
    this.frame.lines.push(line);
    this.frame.actualHeight += line.height;

    // this.y += maxAscent + maxDescent;
    this.y += line.height;

    this.lineBuffer.length = 0;
    this.lineWidth = this.maxAscent = this.maxDescent = this.maxAscentForBlank = this.maxDescentForBlank = 0;
  }

  // 处理paragraph
  // singleLine表示是否将这个作为单行处理，也就是不拆多行了
  deal(paragraph: Paragraph | RichTextIcon, singleLine: boolean = false) {
    if (paragraph instanceof RichTextIcon) {
      if (
        (this.direction === 'horizontal' && this.width === 0) ||
        (this.direction === 'vertical' && this.height === 0)
      ) {
        // width为0时，宽度不设限制，不主动换行
        this.store(paragraph);
      } else {
        if (this.lineWidth + paragraph[this.directionKey.width] <= this[this.directionKey.width]) {
          this.store(paragraph);
        } else if (this.lineBuffer.length === 0) {
          this.store(paragraph);
          this.send();
        } else {
          this.send();
          this.deal(paragraph);
        }
      }

      return;
    }

    // 可能会出现宽度为负的情况，此时不处理数据
    if (typeof this.width !== 'number' || this.width < 0) {
      return;
    }

    if (paragraph.newLine) {
      // 需要换行前，先完成上一行绘制
      this.send();
    }

    if (paragraph.text.length === 0) {
      return;
    } // 换行符分割出的Paragraph不进入line

    if ((this.direction === 'horizontal' && this.width === 0) || (this.direction === 'vertical' && this.height === 0)) {
      // width为0时，宽度不设限制，不主动换行
      this.store(paragraph);
    } else {
      // // width为有效值时，按照宽度限制，主动换行
      // if (this.lineWidth + paragraph.width <= this.width) {
      //   this.store(paragraph);
      // } else if (this.lineWidth === this.width) {
      //   this.send();
      //   // this.store(paragraph);
      //   this.deal(paragraph);
      // } else {
      //   this.cut(paragraph);
      // }
      if (this.lineWidth + paragraph[this.directionKey.width] <= this[this.directionKey.width]) {
        this.store(paragraph);
      } else if (this.lineWidth === this[this.directionKey.width]) {
        this.send();
        this.deal(paragraph);
      } else {
        this.cut(paragraph, singleLine);
      }
    }
  }

  // 文字超长，按需截断
  // 如果singleLine的话，最多就拆两行
  cut(paragraph: Paragraph, singleLine?: boolean) {
    // if (this.direction === 'vertical' && this.lineBuffer.length) {
    //     // 纵排不做paragraph内截断
    //     this.send();
    //     this.deal(paragraph);
    //     return;
    // } else if (this.direction === 'vertical') {
    //     // 超长不处理？
    //     this.store(paragraph);
    //     this.send();
    //     return;
    // }
    const availableWidth = this[this.directionKey.width] - this.lineWidth || 0;
    const guessIndex = Math.ceil((availableWidth / paragraph[this.directionKey.width]) * paragraph.length) || 0;
    // const index = getStrByWith(paragraph.text, availableWidth, paragraph.style, guessIndex, true);
    const index = getStrByWithCanvas(
      paragraph.text,
      availableWidth,
      paragraph.character,
      guessIndex,
      this.frame.wordBreak === 'break-word'
    );
    if (index !== 0) {
      const [p1, p2] = seperateParagraph(paragraph, index);
      this.store(p1);
      if (singleLine) {
        this.send();
      } else {
        this.deal(p2);
      }
    } else if (this.lineBuffer.length !== 0) {
      // 当前行无法容纳，转下一行处理
      this.send();
      this.deal(paragraph);
    }
    // 宽度过低，无法截断（容不下第一个字符的宽度），不处理
  }
}
