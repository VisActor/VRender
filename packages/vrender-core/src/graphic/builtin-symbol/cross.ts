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
// https://github.com/d3/d3-shape/blob/main/src/symbol/cross.js
export function cross(ctx: IContext2d, r: number, x: number, y: number, z?: number) {
  ctx.moveTo(-3 * r + x, -r + y, z);
  ctx.lineTo(-r + x, -r + y, z);
  ctx.lineTo(-r + x, -3 * r + y, z);
  ctx.lineTo(r + x, -3 * r + y, z);
  ctx.lineTo(r + x, -r + y, z);
  ctx.lineTo(3 * r + x, -r + y, z);
  ctx.lineTo(3 * r + x, r + y, z);
  ctx.lineTo(r + x, r + y, z);
  ctx.lineTo(r + x, 3 * r + y, z);
  ctx.lineTo(-r + x, 3 * r + y, z);
  ctx.lineTo(-r + x, r + y, z);
  ctx.lineTo(-3 * r + x, r + y, z);
  ctx.closePath();
  return true;
}

export function crossOffset(ctx: IContext2d, r: number, x: number, y: number, offset: number, z?: number) {
  ctx.moveTo(-3 * r + x - offset, -r + y - offset, z);
  ctx.lineTo(-r + x - offset, -r + y - offset, z);
  ctx.lineTo(-r + x - offset, -3 * r + y - offset, z);
  ctx.lineTo(r + x + offset, -3 * r + y - offset, z);
  ctx.lineTo(r + x + offset, -r + y - offset, z);
  ctx.lineTo(3 * r + x + offset, -r + y - offset, z);
  ctx.lineTo(3 * r + x + offset, r + y + offset, z);
  ctx.lineTo(r + x + offset, r + y + offset, z);
  ctx.lineTo(r + x + offset, 3 * r + y + offset, z);
  ctx.lineTo(-r + x - offset, 3 * r + y + offset, z);
  ctx.lineTo(-r + x - offset, r + y + offset, z);
  ctx.lineTo(-3 * r + x - offset, r + y + offset, z);
  ctx.closePath();
  return true;
}

// 以中心为锚点，size为circle外接正方形的边长
export class CrossSymbol extends BaseSymbol implements ISymbolClass {
  type: SymbolType = 'cross';
  /* eslint-disable max-len */
  pathStr: string =
    'M-0.5,-0.2L-0.5,0.2L-0.2,0.2L-0.2,0.5L0.2,0.5L0.2,0.2L0.5,0.2L0.5,-0.2L0.2,-0.2L0.2,-0.5L-0.2,-0.5L-0.2,-0.2Z';

  draw(ctx: IContext2d, size: number, x: number, y: number, z?: number) {
    const r = this.parseSize(size) / 6;
    return cross(ctx, r, x, y, z);
  }

  drawOffset(ctx: IContext2d, size: number, x: number, y: number, offset: number, z?: number) {
    const r = this.parseSize(size) / 6;
    return crossOffset(ctx, r, x, y, offset, z);
  }
}

export default new CrossSymbol();
