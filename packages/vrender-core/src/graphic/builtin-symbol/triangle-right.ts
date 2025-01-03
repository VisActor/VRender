import type { IBounds } from '@visactor/vutils';
import type { IContext2d, SymbolType, ISymbolClass } from '../../interface';
import { BaseSymbol } from './base';

/**
 *
 *Copyright 2010-2021 Mike Bostock

  Permission to use, copy, modify, and/or distribute this software for any purpose
  with or without fee is hereby granted, provided that the above copyright notice
  and this permission notice appear in all copies.

  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
  FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
  OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
  TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
  THIS SOFTWARE.
 */
// 借鉴自d3
// https://github.com/d3/d3-shape/blob/main/src/symbol/triangle.js

export function trianglRightOffset(ctx: IContext2d, r: number, x: number, y: number, offset: number = 0) {
  ctx.moveTo(x - r - offset, r + y + 2 * offset);
  ctx.lineTo(r + x + 2 * offset, y);
  ctx.lineTo(x - r - offset, y - r - 2 * offset);
  ctx.closePath();
  return true;
}

// 以中心为锚点，size为circle外接正方形的面积
export class TriangleRightSymbol extends BaseSymbol implements ISymbolClass {
  type: SymbolType = 'triangleRight';
  pathStr: string = 'M-0.5,0.5 L0.5,0 L-0.5,-0.5 Z';

  draw(ctx: IContext2d, size: number, x: number, y: number) {
    const r = this.parseSize(size) / 2;
    return trianglRightOffset(ctx, r, x, y);
  }

  drawOffset(ctx: IContext2d, size: number, x: number, y: number, offset: number) {
    const r = this.parseSize(size) / 2;
    return trianglRightOffset(ctx, r, x, y, offset);
  }
}

export default new TriangleRightSymbol();
