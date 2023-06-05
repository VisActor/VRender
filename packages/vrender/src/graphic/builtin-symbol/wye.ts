import { IBounds, sqrt } from '@visactor/vutils';
import { IContext2d, SymbolType } from '../../interface';
import { ISymbolClass } from './interface';

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
// https://github.com/d3/d3-shape/blob/main/src/symbol/wye.js
const c = -0.5;
const s = sqrt(3) / 2;
const k = 1 / sqrt(12);
const a = (k / 2 + 1) * 3;
export function wye(ctx: IContext2d, r: number, transX: number, transY: number) {
  const x0 = r / 2;
  const y0 = r * k;
  const x1 = x0;
  const y1 = r * k + r;
  const x2 = -x1;
  const y2 = y1;
  ctx.moveTo(x0 + transX, y0 + transY);
  ctx.lineTo(x1 + transX, y1 + transY);
  ctx.lineTo(x2 + transX, y2 + transY);
  ctx.lineTo(c * x0 - s * y0 + transX, s * x0 + c * y0 + transY);
  ctx.lineTo(c * x1 - s * y1 + transX, s * x1 + c * y1 + transY);
  ctx.lineTo(c * x2 - s * y2 + transX, s * x2 + c * y2 + transY);
  ctx.lineTo(c * x0 + s * y0 + transX, c * y0 - s * x0 + transY);
  ctx.lineTo(c * x1 + s * y1 + transX, c * y1 - s * x1 + transY);
  ctx.lineTo(c * x2 + s * y2 + transX, c * y2 - s * x2 + transY);
  ctx.closePath();
  return false;
}

// 以中心为锚点，size为wye外接正方形的面积
export class WyeSymbol implements ISymbolClass {
  type: SymbolType = 'wye';
  /* eslint-disable max-len */
  pathStr: string =
    /* eslint-disable max-len */
    'M4.51351666838205,0A4.51351666838205,4.51351666838205,0,1,1,-4.51351666838205,0A4.51351666838205,4.51351666838205,0,1,1,4.51351666838205,0';

  draw(ctx: IContext2d, size: number, transX: number, transY: number) {
    const r = size / 2;
    // const r = sqrt(size / a);
    return wye(ctx, r, transX, transY);
  }

  drawOffset(ctx: IContext2d, size: number, transX: number, transY: number, offset: number) {
    const r = size / 2 + offset;
    // const r = sqrt(size / a);
    return wye(ctx, r, transX, transY);
  }

  bounds(size: number, bounds: IBounds) {
    const r = size / 2;
    // const r = sqrt(size / a);//d3 用的这个
    bounds.x1 = -r;
    bounds.x2 = r;
    bounds.y1 = -r;
    bounds.y2 = r;
  }
}

export default new WyeSymbol();
