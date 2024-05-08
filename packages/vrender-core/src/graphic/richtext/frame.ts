// import { IContext2d } from '../../IContext';
import type { IContext2d, IRichTextIcon } from '../../interface';
import type Line from './line';
import { DIRECTION_KEY } from './utils';

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

// 文字窗口
// 参考carota
// https://github.com/danielearwicker/carota/blob/master/src/frame.js
export default class Frame {
  left: number;
  top: number;
  bottom: number;
  right: number;
  width: number;
  height: number;
  actualHeight: number;
  ellipsis: boolean | string;
  wordBreak: 'break-word' | 'break-all';
  verticalDirection: 'top' | 'middle' | 'bottom';
  lines: Line[];
  // ctx: IContext2d;
  globalAlign: 'left' | 'center' | 'right' | 'start' | 'end';
  globalBaseline: 'top' | 'middle' | 'bottom';
  layoutDirection: 'horizontal' | 'vertical';
  directionKey: { width: string; height: string; left: string; top: string; bottom: string };
  isWidthMax: boolean;
  isHeightMax: boolean;

  singleLine: boolean;

  icons: Map<string, IRichTextIcon>;

  constructor(
    left: number,
    top: number,
    width: number,
    height: number,
    ellipsis: boolean | string,
    wordBreak: 'break-word' | 'break-all',
    verticalDirection: 'top' | 'middle' | 'bottom',
    // ctx: IContext2d,
    globalAlign: 'left' | 'center' | 'right' | 'start' | 'end',
    globalBaseline: 'top' | 'middle' | 'bottom',
    layoutDirection: 'horizontal' | 'vertical',
    isWidthMax: boolean,
    isHeightMax: boolean,
    singleLine: boolean,
    icons?: Map<string, IRichTextIcon>
  ) {
    this.left = left;
    this.top = top;
    this.width = width;
    this.height = height;
    this.actualHeight = 0;
    this.bottom = top + height;
    this.right = left + width;
    this.ellipsis = ellipsis;
    this.wordBreak = wordBreak;
    this.verticalDirection = verticalDirection;
    this.lines = [];
    // this.ctx = ctx;
    this.globalAlign = globalAlign;
    this.globalBaseline = globalBaseline;
    this.layoutDirection = layoutDirection;
    this.directionKey = DIRECTION_KEY[this.layoutDirection];

    this.isWidthMax = isWidthMax;
    this.isHeightMax = isHeightMax;

    this.singleLine = singleLine;

    if (icons) {
      icons.clear();
      this.icons = icons;
    } else {
      this.icons = new Map();
    }
  }

  draw(
    ctx: IContext2d,
    drawIcon: (icon: IRichTextIcon, context: IContext2d, x: number, y: number, baseline: number) => void
  ) {
    const { width: actualWidth, height: actualHeight } = this.getActualSize();
    const width = this.isWidthMax ? Math.min(this.width, actualWidth) : this.width || actualWidth || 0;
    let height = this.isHeightMax ? Math.min(this.height, actualHeight) : this.height || actualHeight || 0;
    // 1. height 可能受 maxHeight 影响大于 actualHeight 计算出来的实际高度
    // 2. actualHeight 是不加省略内容的高度，可能会大于 height
    // 以上两种情况都可以通过 Math.min 解决
    height = Math.min(height, actualHeight);
    /**
     * 根据 align 和 baseline 进行偏移
     */
    let deltaY = 0;
    switch (this.globalBaseline) {
      case 'top':
        deltaY = 0;
        break;
      case 'middle':
        deltaY = -height / 2;
        break;
      case 'bottom':
        deltaY = -height;
        break;
      default:
        break;
    }

    let deltaX = 0;
    if (this.globalAlign === 'right' || this.globalAlign === 'end') {
      deltaX = -width;
    } else if (this.globalAlign === 'center') {
      deltaX = -width / 2;
    }

    let frameHeight = this[this.directionKey.height];
    if (this.singleLine) {
      frameHeight = this.lines[0].height + 1;
    }
    let lastLineTag = false;
    if (this.verticalDirection === 'middle') {
      if (this.actualHeight >= frameHeight && frameHeight !== 0) {
        for (let i = 0; i < this.lines.length; i++) {
          const { top, height } = this.lines[i];
          if (top + height < this[this.directionKey.top] || top + height > this[this.directionKey.top] + frameHeight) {
            return lastLineTag; // 不在展示范围内的line不绘制
          }
          // 判断需要显示省略号且是展示范围内的最后一行
          let lastLine = false;
          if (
            this.ellipsis &&
            this.lines[i + 1] &&
            this.lines[i + 1].top + this.lines[i + 1].height > this[this.directionKey.top] + frameHeight
          ) {
            lastLine = true;
            lastLineTag = true;
          }
          this.lines[i].draw(
            ctx,
            lastLine,
            this.lines[i][this.directionKey.left] + deltaX,
            this.lines[i][this.directionKey.top] + deltaY,
            this.ellipsis,
            drawIcon
          );
        }
      } else {
        const detalHeight = Math.floor((frameHeight - this.actualHeight) / 2);
        if (this.layoutDirection === 'vertical') {
          deltaX += detalHeight;
        } else {
          deltaY += detalHeight;
        }
        for (let i = 0; i < this.lines.length; i++) {
          this.lines[i].draw(
            ctx,
            false,
            this.lines[i][this.directionKey.left] + deltaX,
            this.lines[i][this.directionKey.top] + deltaY,
            this.ellipsis,
            drawIcon
          );
        }
      }

      // top = this.top + (this.height - this.actualHeight) / 2
    } else if (this.verticalDirection === 'bottom' && this.layoutDirection !== 'vertical') {
      for (let i = 0; i < this.lines.length; i++) {
        const { top, height } = this.lines[i];
        const y = frameHeight - this.lines[i].top - this.lines[i].height;
        // if (y + height < this.top || y + height > this.bottom) {
        if (frameHeight === 0) {
          this.lines[i].draw(ctx, false, deltaX, y + deltaY, this.ellipsis, drawIcon);
        } else if (y + height > this[this.directionKey.top] + frameHeight || y < this[this.directionKey.top]) {
          return lastLineTag; // 不在展示范围内的line不绘制
        } else {
          // 判断需要显示省略号且是展示范围内的最后一行
          let lastLine = false;
          if (this.ellipsis && this.lines[i + 1] && y - this.lines[i + 1].height < this[this.directionKey.top]) {
            lastLine = true;
            lastLineTag = true;
          }
          this.lines[i].draw(ctx, lastLine, deltaX, y + deltaY, this.ellipsis, drawIcon);
        }
      }
    } else {
      if (
        this.verticalDirection === 'bottom' &&
        this.layoutDirection === 'vertical' &&
        this.singleLine &&
        this.isWidthMax
      ) {
        deltaX += this.lines[0].height + 1;
      }
      for (let i = 0; i < this.lines.length; i++) {
        if (this.verticalDirection === 'bottom' && this.layoutDirection === 'vertical') {
          deltaX -= this.lines[i].height + this.lines[i].top;
        }
        const { top, height } = this.lines[i];
        if (frameHeight === 0) {
          this.lines[i].draw(
            ctx,
            false,
            this.lines[i][this.directionKey.left] + deltaX,
            this.lines[i][this.directionKey.top] + deltaY,
            this.ellipsis,
            drawIcon
          );
        } else if (
          top + height < this[this.directionKey.top] ||
          top + height > this[this.directionKey.top] + frameHeight
        ) {
          return lastLineTag; // 不在展示范围内的line不绘制
        } else {
          // 判断需要显示省略号且是展示范围内的最后一行
          let lastLine = false;
          if (
            this.ellipsis &&
            this.lines[i + 1] &&
            this.lines[i + 1].top + this.lines[i + 1].height > this[this.directionKey.top] + frameHeight
          ) {
            lastLine = true;
            lastLineTag = true;
          }
          this.lines[i].draw(
            ctx,
            lastLine,
            this.lines[i][this.directionKey.left] + deltaX,
            this.lines[i][this.directionKey.top] + deltaY,
            this.ellipsis,
            drawIcon
          );
        }
      }
    }

    return lastLineTag;
  }

  getActualSize(): { width: number; height: number } {
    if (this.ellipsis) {
      return this.getActualSizeWidthEllipsis();
    }

    return this.getRawActualSize();
  }

  getRawActualSize(): { width: number; height: number } {
    let width: number = 0;
    let height: number = 0;
    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i];
      if (line.actualWidth > width) {
        width = line.actualWidth;
      }
      height += line.height;
    }

    // return { width, height };
    return {
      width: this.layoutDirection === 'vertical' ? height : width,
      height: this.layoutDirection === 'vertical' ? width : height
    };
  }

  getActualSizeWidthEllipsis(): { width: number; height: number } {
    let widthBound: number = 0;
    let heightBound: number = 0;

    const { width: actualWidth, height: actualHeight } = this.getRawActualSize();
    const width = this.width || actualWidth || 0;
    let height = this.height || actualHeight || 0;
    // 1. height 可能受 maxHeight 影响大于 actualHeight 计算出来的实际高度
    // 2. actualHeight 是不加省略内容的高度，可能会大于 height
    // 以上两种情况都可以通过 Math.min 解决
    height = Math.min(height, actualHeight);
    /**
     * 根据 align 和 baseline 进行偏移
     */
    const deltaY = 0;

    let frameHeight = this[this.directionKey.height];
    if (this.singleLine) {
      frameHeight = this.lines[0].height + 1;
    }

    if (this.verticalDirection === 'middle') {
      if (this.actualHeight >= frameHeight && frameHeight !== 0) {
        for (let i = 0; i < this.lines.length; i++) {
          const { top, height } = this.lines[i];
          if (top + height < this[this.directionKey.top] || top + height > this[this.directionKey.top] + frameHeight) {
            // return; // 不在展示范围内的line不绘制
          } else {
            // 判断需要显示省略号且是展示范围内的最后一行
            if (
              this.ellipsis &&
              this.lines[i + 1] &&
              this.lines[i + 1].top + this.lines[i + 1].height > this[this.directionKey.top] + frameHeight
            ) {
              const ellipsis = this.ellipsis === true ? '...' : this.ellipsis || '';
              const lineWidth = this.lines[i].getWidthWithEllips(ellipsis);
              if (lineWidth > widthBound) {
                widthBound = lineWidth;
              }
              heightBound += this.lines[i].height;
            } else {
              if (this.lines[i].actualWidth > widthBound) {
                widthBound = this.lines[i].actualWidth;
              }
              heightBound += this.lines[i].height;
            }
            // this.lines[i].draw(ctx, lastLine, deltaX, this.lines[i].top + deltaY);
          }
        }
      } else {
        const detalHeight = Math.floor((frameHeight - this.actualHeight) / 2);
        for (let i = 0; i < this.lines.length; i++) {
          if (this.lines[i].actualWidth > widthBound) {
            widthBound = this.lines[i].actualWidth;
          }
          heightBound += this.lines[i].height;
        }
      }

      // top = this.top + (this.height - this.actualHeight) / 2
    } else if (this.verticalDirection === 'bottom') {
      for (let i = 0; i < this.lines.length; i++) {
        const { top, height } = this.lines[i];
        const y = frameHeight - this.lines[i].top - this.lines[i].height;
        // if (y + height < this.top || y + height > this.bottom) {
        if (frameHeight === 0) {
          if (this.lines[i].actualWidth > widthBound) {
            widthBound = this.lines[i].actualWidth;
          }
          heightBound += this.lines[i].height;
        } else if (y + height > this[this.directionKey.top] + frameHeight || y < this[this.directionKey.top]) {
          // return; // 不在展示范围内的line不绘制
        } else {
          // 判断需要显示省略号且是展示范围内的最后一行
          const lastLine = false;
          if (this.ellipsis && this.lines[i + 1] && y - this.lines[i + 1].height < this[this.directionKey.top]) {
            const ellipsis = this.ellipsis === true ? '...' : this.ellipsis || '';
            const lineWidth = this.lines[i].getWidthWithEllips(ellipsis);
            if (lineWidth > widthBound) {
              widthBound = lineWidth;
            }
            heightBound += this.lines[i].height;
          } else {
            if (this.lines[i].actualWidth > widthBound) {
              widthBound = this.lines[i].actualWidth;
            }
            heightBound += this.lines[i].height;
          }
        }
      }
    } else {
      for (let i = 0; i < this.lines.length; i++) {
        const { top, height } = this.lines[i];
        if (frameHeight === 0) {
          if (this.lines[i].actualWidth > widthBound) {
            widthBound = this.lines[i].actualWidth;
          }
          heightBound += this.lines[i].height;
        } else if (
          top + height < this[this.directionKey.top] ||
          top + height > this[this.directionKey.top] + frameHeight
        ) {
          // return; // 不在展示范围内的line不绘制
        } else {
          // 判断需要显示省略号且是展示范围内的最后一行
          const lastLine = false;
          if (
            this.ellipsis &&
            this.lines[i + 1] &&
            this.lines[i + 1].top + this.lines[i + 1].height > this[this.directionKey.top] + frameHeight
          ) {
            const ellipsis = this.ellipsis === true ? '...' : this.ellipsis || '';
            const lineWidth = this.lines[i].getWidthWithEllips(ellipsis);
            if (lineWidth > widthBound) {
              widthBound = lineWidth;
            }
            heightBound += this.lines[i].height;
          } else {
            if (this.lines[i].actualWidth > widthBound) {
              widthBound = this.lines[i].actualWidth;
            }
            heightBound += this.lines[i].height;
          }
        }
      }
    }

    return {
      width: this.layoutDirection === 'vertical' ? heightBound : widthBound,
      height: this.layoutDirection === 'vertical' ? widthBound : heightBound
    };
  }
}
