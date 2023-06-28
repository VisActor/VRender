import type { IBounds } from '@visactor/vutils';
import { tau } from '@visactor/vutils';
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
// https://github.com/d3/d3-shape/blob/main/src/symbol/circle.js
export function circle(ctx: IContext2d, r: number, x: number, y: number, z?: number) {
  // ctx.moveTo(r, 0);
  if (z) {
    ctx.arc(x, y, r, 0, tau, false, z);
  } else {
    ctx.arc(x, y, r, 0, tau);
  }
  return false;
}

// 以中心为锚点，size为circle外接正方形的面积
export class CircleSymbol implements ISymbolClass {
  type: SymbolType = 'circle';
  pathStr: string = 'M0.5,0A0.5,0.5,0,1,1,-0.5,0A0.5,0.5,0,1,1,0.5,0';

  draw(ctx: IContext2d, size: number, x: number, y: number, z?: number) {
    const r = size / 2;
    return circle(ctx, r, x, y, z);
  }

  drawOffset(ctx: IContext2d, size: number, x: number, y: number, offset: number, z?: number) {
    const r = size / 2 + offset;
    return circle(ctx, r, x, y, z);
  }

  bounds(size: number, bounds: IBounds) {
    const r = size / 2;
    bounds.x1 = -r;
    bounds.x2 = r;
    bounds.y1 = -r;
    bounds.y2 = r;
  }
}

export default new CircleSymbol();
