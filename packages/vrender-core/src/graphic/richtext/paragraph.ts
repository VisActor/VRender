import { calculateLineHeight } from '../../common/utils';
import type { IContext2d, IRichTextParagraphCharacter } from '../../interface';
import { measureTextCanvas, getStrByWithCanvas } from './utils';

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

// 文字段
// 参考carota
// https://github.com/danielearwicker/carota/blob/master/src/text.js
export default class Paragraph {
  text: string;
  ascent: number;
  descent: number;
  width: number;
  height: number;
  lineHeight: number;
  fontSize: number;
  length: number;
  newLine: boolean;
  character: IRichTextParagraphCharacter;
  left: number;
  top: number;
  // rotate?: number;
  direction?: 'horizontal' | 'vertical';
  // bounds?: Bounds;
  widthOrigin?: number;
  heightOrigin?: number;
  textBaseline?: CanvasTextBaseline;

  ellipsis: 'normal' | 'add' | 'replace' | 'hide';
  ellipsisStr: string;
  ellipsisWidth: number;
  ellipsisOtherParagraphWidth: number;
  verticalEllipsis?: boolean;
  overflow?: boolean;

  constructor(text: string, newLine: boolean, character: IRichTextParagraphCharacter) {
    // 测量文字
    this.fontSize = character.fontSize || 16;
    this.textBaseline = character.textBaseline || 'alphabetic';

    // 处理行高：
    // lineHeight为数字时，大于fontSize取lineHeight，小于fontSize时取fontSize
    // lineHeight不为数字时，统一认为lineHeight为'normal'，值取1.2 * fontSize
    const lineHeight = calculateLineHeight(character.lineHeight, this.fontSize);
    if (typeof lineHeight === 'number') {
      this.lineHeight = lineHeight > this.fontSize ? lineHeight : this.fontSize;
    } else {
      this.lineHeight = Math.floor(1.2 * this.fontSize);
    }

    this.height = this.lineHeight;

    const { ascent, height, descent, width } = measureTextCanvas(text, character);

    let halfDetaHeight = 0;
    let deltaAscent = 0;
    let deltaDescent = 0;
    if (this.height > height) {
      // measureTextCanvas测量出的是纯文字高度，this.height是考虑行高后的高度
      // 如果this.height > height，将超过的高度平均分配到ascent和descent上
      halfDetaHeight = (this.height - height) / 2;
      deltaAscent = Math.ceil(halfDetaHeight);
      deltaDescent = Math.floor(halfDetaHeight);
    }

    if (this.textBaseline === 'top') {
      this.ascent = halfDetaHeight;
      this.descent = height - halfDetaHeight;
    } else if (this.textBaseline === 'bottom') {
      this.ascent = height - halfDetaHeight;
      this.descent = halfDetaHeight;
    } else if (this.textBaseline === 'middle') {
      this.ascent = this.height / 2;
      this.descent = this.height / 2;
    } else {
      this.ascent = ascent + deltaAscent;
      this.descent = descent + deltaDescent;
    }

    this.length = text.length;
    this.width = width || 0;
    this.text = text || '';
    this.newLine = newLine || false;
    this.character = character;

    this.left = 0;
    this.top = 0;

    this.ellipsis = 'normal';
    this.ellipsisWidth = 0;
    this.ellipsisOtherParagraphWidth = 0;

    // 处理旋转
    if (character.direction === 'vertical') {
      this.direction = character.direction;
      this.widthOrigin = this.width;
      this.heightOrigin = this.height;
      // const bounds = new Bounds();
      // bounds.set(0, 0, this.width, this.height);
      // bounds.rotate(Math.PI / 2, this.width / 2, this.height / 2);
      // this.bounds = bounds;
      // this.width = bounds.width();
      // this.height = bounds.height();
      this.width = this.heightOrigin;
      this.height = this.widthOrigin;
      this.lineHeight = this.height;
    }
    this.ellipsisStr = '...';
  }

  updateWidth() {
    const { width } = measureTextCanvas(this.text, this.character);
    this.width = width;
    if (this.direction === 'vertical') {
      this.widthOrigin = this.width;
      this.width = this.heightOrigin;
      this.height = this.widthOrigin;
    }
  }

  draw(ctx: IContext2d, baseline: number, deltaLeft: number, isLineFirst: boolean, textAlign: string) {
    let text = this.text;
    let left = this.left + deltaLeft;
    baseline += this.top;
    let direction = this.direction;

    if (this.verticalEllipsis) {
      text = this.ellipsisStr;
      direction = 'vertical';
      baseline -= this.ellipsisWidth / 2;
    } else if (this.ellipsis === 'hide') {
      return;
    } else if (this.ellipsis === 'add') {
      text += this.ellipsisStr;

      if (textAlign === 'right' || textAlign === 'end') {
        left -= this.ellipsisWidth;
      }
    } else if (this.ellipsis === 'replace') {
      // 找到需要截断的字符长度
      // const index = getStrByWith(text, this.width - this.ellipsisWidth + this.ellipsisOtherParagraphWidth, this.style, text.length - 1);
      const index = getStrByWithCanvas(
        text,
        (direction === 'vertical' ? this.height : this.width) - this.ellipsisWidth + this.ellipsisOtherParagraphWidth,
        this.character,
        text.length - 1
      );
      text = text.slice(0, index);
      text += this.ellipsisStr;

      if (textAlign === 'right' || textAlign === 'end') {
        const { width } = measureTextCanvas(this.text.slice(index), this.character);
        if (direction === 'vertical') {
          // baseline -= this.ellipsisWidth - width;
        } else {
          left -= this.ellipsisWidth - width;
        }
      }
    }

    // prepareContext(ctx);
    switch (this.character.script) {
      case 'super':
        baseline -= this.ascent * (1 / 3);
        break;
      case 'sub':
        baseline += this.descent / 2;
        break;
    }

    // if (isLineFirst) {
    //   const result = regFirstSpace.exec(text);
    //   if (result?.index !== 0) {
    //     text = text.slice(result?.index);
    //   }
    // }

    // 处理旋转
    if (direction === 'vertical') {
      ctx.save();
      ctx.rotateAbout(Math.PI / 2, left, baseline);
      ctx.translate(-(this.heightOrigin as number) || -this.lineHeight / 2, -this.descent / 2);
      ctx.translate(left, baseline);
      left = 0;
      baseline = 0;
    }

    const { lineWidth = 1 } = this.character;
    if (this.character.stroke && lineWidth) {
      ctx.strokeText(text, left, baseline);
    }

    if (this.character.fill) {
      ctx.fillText(text, left, baseline);
    }

    if (this.character.fill) {
      if (typeof this.character.lineThrough === 'boolean' || typeof this.character.underline === 'boolean') {
        if (this.character.underline) {
          ctx.fillRect(
            left,
            1 + baseline,
            this.widthOrigin || this.width,
            this.character.fontSize ? Math.max(1, Math.floor(this.character.fontSize / 10)) : 1
          );
        }
        if (this.character.lineThrough) {
          ctx.fillRect(
            left,
            1 + baseline - this.ascent / 2,
            this.widthOrigin || this.width,
            this.character.fontSize ? Math.max(1, Math.floor(this.character.fontSize / 10)) : 1
          );
        }
      } else if (this.character.textDecoration === 'underline') {
        ctx.fillRect(
          left,
          1 + baseline,
          this.widthOrigin || this.width,
          this.character.fontSize ? Math.max(1, Math.floor(this.character.fontSize / 10)) : 1
        );
      } else if (this.character.textDecoration === 'line-through') {
        ctx.fillRect(
          left,
          1 + baseline - this.ascent / 2,
          this.widthOrigin || this.width,
          this.character.fontSize ? Math.max(1, Math.floor(this.character.fontSize / 10)) : 1
        );
      }
    }

    if (direction === 'vertical') {
      ctx.restore();
    }
  }

  getWidthWithEllips(direction: string): number {
    let text = this.text;
    // const direction = this.direction;
    const width = direction === 'vertical' ? this.height : this.width;
    // const height = direction === 'vertical' ? this.width: this.height;

    if (this.ellipsis === 'hide') {
      return width;
    } else if (this.ellipsis === 'add') {
      return width + this.ellipsisWidth;
    } else if (this.ellipsis === 'replace') {
      // 找到需要截断的字符长度
      // const index = getStrByWith(text, width - this.ellipsisWidth + this.ellipsisOtherParagraphWidth, this.style, text.length - 1);
      const index = getStrByWithCanvas(
        text,
        width - this.ellipsisWidth + this.ellipsisOtherParagraphWidth,
        this.character,
        text.length - 1
      );
      text = text.slice(0, index);
      text += this.ellipsisStr;

      const { width: measureWidth } = measureTextCanvas(this.text.slice(index), this.character);
      return width + this.ellipsisWidth - measureWidth;
    }
    return width;
  }
}

export function seperateParagraph(paragraph: Paragraph, index: number) {
  const text1 = paragraph.text.slice(0, index);
  const text2 = paragraph.text.slice(index);
  const p1 = new Paragraph(text1, paragraph.newLine, paragraph.character);
  const p2 = new Paragraph(text2, true, paragraph.character);

  return [p1, p2];
}
