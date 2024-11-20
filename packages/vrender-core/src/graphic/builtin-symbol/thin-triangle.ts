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
// https://github.com/d3/d3-shape/blob/main/src/symbol/triangle.js

const sqrt3 = sqrt(3);

export function thinTriangle(ctx: IContext2d, r: number, x: number, y: number) {
  const h = r * sqrt3;
  ctx.moveTo(x, y + (-h / 3) * 2);
  ctx.lineTo(r + x, y + h);
  ctx.lineTo(x - r, y + h);
  ctx.closePath();
  return true;
}

export class ThinTriangleSymbol extends BaseSymbol implements ISymbolClass {
  type: SymbolType = 'thinTriangle';
  pathStr: string = 'M0,-0.5773502691896257L-0.5,0.28867513459481287L0.5,0.28867513459481287Z';

  draw(ctx: IContext2d, size: number, x: number, y: number) {
    const r = this.parseSize(size) / 2 / sqrt3;
    return thinTriangle(ctx, r, x, y);
  }

  drawOffset(ctx: IContext2d, size: number, x: number, y: number, offset: number) {
    const r = this.parseSize(size) / 2 / sqrt3 + offset;
    return thinTriangle(ctx, r, x, y);
  }
}

export default new ThinTriangleSymbol();
