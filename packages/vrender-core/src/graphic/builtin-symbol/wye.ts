import type { IBounds } from '@visactor/vutils';
import { sqrt } from '@visactor/vutils';
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
export class WyeSymbol extends BaseSymbol implements ISymbolClass {
  type: SymbolType = 'wye';
  /* eslint-disable max-len */
  pathStr: string =
    /* eslint-disable max-len */
    'M0.25 0.14433756729740646L0.25 0.6443375672974064L-0.25 0.6443375672974064L-0.25 0.14433756729740643L-0.6830127018922193 -0.10566243270259357L-0.4330127018922193 -0.5386751345948129L0 -0.28867513459481287L0.4330127018922193 -0.5386751345948129L0.6830127018922193 -0.10566243270259357Z';

  draw(ctx: IContext2d, size: number, transX: number, transY: number) {
    const r = this.parseSize(size) / 2;
    // const r = sqrt(size / a);
    return wye(ctx, r, transX, transY);
  }

  drawOffset(ctx: IContext2d, size: number, transX: number, transY: number, offset: number) {
    const r = this.parseSize(size) / 2 + offset;
    // const r = sqrt(size / a);
    return wye(ctx, r, transX, transY);
  }
}

export default new WyeSymbol();
