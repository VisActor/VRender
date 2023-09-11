import type { IBounds } from '@visactor/vutils';
import { tau } from '@visactor/vutils';
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
// https://github.com/d3/d3-shape/blob/main/src/symbol/star.js
// const ka = 0.8908130915292852281;
const kr = Math.sin(Math.PI / 10) / Math.sin((7 * Math.PI) / 10);
const kx = Math.sin(tau / 10) * kr;
const ky = -Math.cos(tau / 10) * kr;
export function star(ctx: IContext2d, r: number, transX: number, transY: number) {
  // const r = sqrt(size * ka);
  const x = kx * r;
  const y = ky * r;
  ctx.moveTo(transX, -r + transY);
  ctx.lineTo(x + transX, y + transY);
  for (let i = 1; i < 5; ++i) {
    const a = (tau * i) / 5;
    const c = Math.cos(a);
    const s = Math.sin(a);
    ctx.lineTo(s * r + transX, -c * r + transY);
    ctx.lineTo(c * x - s * y + transX, s * x + c * y + transY);
  }
  ctx.closePath();
  return true;
}

// 以中心为锚点，size为circle外接正方形的面积
export class StarSymbol extends BaseSymbol implements ISymbolClass {
  type: SymbolType = 'star';
  /* eslint-disable max-len */
  pathStr: string =
    /* eslint-disable max-len */
    'M4.51351666838205,0A4.51351666838205,4.51351666838205,0,1,1,-4.51351666838205,0A4.51351666838205,4.51351666838205,0,1,1,4.51351666838205,0';

  draw(ctx: IContext2d, size: number, transX: number, transY: number) {
    const r = size / 2;
    return star(ctx, r, transX, transY);
  }

  drawOffset(ctx: IContext2d, size: number, transX: number, transY: number, offset: number) {
    const r = size / 2 + offset;
    return star(ctx, r, transX, transY);
  }
}

export default new StarSymbol();
