import type { IBounds } from '@visactor/vutils';
import type { IContext2d, SymbolType, ISymbolClass } from '../../interface';

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

export function trianglLeft(ctx: IContext2d, r: number, x: number, y: number) {
  ctx.moveTo(-r + x, y);
  ctx.lineTo(r + x, r + y);
  ctx.lineTo(r + x, y - r);
  ctx.closePath();
  return true;
}

export function trianglLeftOffset(ctx: IContext2d, r: number, x: number, y: number, offset: number) {
  ctx.moveTo(-r + x - 2 * offset, y);
  ctx.lineTo(r + x + offset, r + y + 2 * offset);
  ctx.lineTo(r + x + offset, y - r - 2 * offset);
  ctx.closePath();
  return true;
}

// 以中心为锚点，size为circle外接正方形的面积
export class TriangleLeftSymbol implements ISymbolClass {
  type: SymbolType = 'triangleLeft';
  pathStr: string = 'M-0.5,0 L0.5,0.5 L0.5,-0.5 Z';

  draw(ctx: IContext2d, size: number, x: number, y: number) {
    const r = size / 2;
    return trianglLeft(ctx, r, x, y);
  }

  drawOffset(ctx: IContext2d, size: number, x: number, y: number, offset: number) {
    const r = size / 2;
    return trianglLeftOffset(ctx, r, x, y, offset);
  }

  bounds(size: number, bounds: IBounds) {
    const r = size / 2;
    bounds.x1 = -r;
    bounds.x2 = r;
    bounds.y1 = -r;
    bounds.y2 = r;
  }
}

export default new TriangleLeftSymbol();
