import type { IBounds } from '@visactor/vutils';
import { isNumber } from '@visactor/vutils';
import type { IContext2d, SymbolType, ISymbolClass, ICustomPath2D, IPath2D } from '../../interface';
import { BaseSymbol } from './base';

/**
 * 部分源码参考 https://github.com/vega/vega/blob/main/packages/vega-scenegraph/src/path/symbols.js
 * Copyright (c) 2015-2023, University of Washington Interactive Data Lab
  All rights reserved.

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

  1. Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.

  2. Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation
    and/or other materials provided with the distribution.

  3. Neither the name of the copyright holder nor the names of its contributors
    may be used to endorse or promote products derived from this software
    without specific prior written permission.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
  DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE
  FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
  DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
  SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
  CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
  OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
  OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

export function rectSizeArray(ctx: IContext2d, size: [number, number], x: number, y: number) {
  ctx.rect(x - size[0] / 2, y - size[1] / 2, size[0], size[1]);
  return false;
}

export function rectSize(ctx: IContext2d, size: number, x: number, y: number) {
  const w = size;
  const h = size / 2;
  ctx.rect(x - w / 2, y - h / 2, w, h);
  return false;
}

// 以中心为锚点，size为circle外接正方形的面积
export class RectSymbol extends BaseSymbol implements ISymbolClass {
  type: SymbolType = 'rect';
  pathStr: string = 'M -0.5,0.25 L 0.5,0.25 L 0.5,-0.25,L -0.5,-0.25 Z';

  draw(ctx: IContext2d, size: number | [number, number], x: number, y: number) {
    if (isNumber(size)) {
      return rectSize(ctx, size, x, y);
    }
    return rectSizeArray(ctx, size, x, y);
    // const rectSize: [number, number] =  ? [size, size] : size;
    // return rect(ctx, rectSize, x, y);
  }

  drawWithClipRange(
    ctx: IPath2D,
    size: number | [number, number],
    x: number,
    y: number,
    clipRange: number,
    z?: number,
    cb?: (p: ICustomPath2D, a: any) => void
  ) {
    if (isNumber(size)) {
      size = [size, size / 2];
    }
    const totalLength = (size[0] + size[1]) * 2;
    const drawLength = totalLength * clipRange;
    const points = [
      { x: x + size[0] / 2, y: y - size[1] / 2 },
      { x: x + size[0] / 2, y: y + size[1] / 2 },
      { x: x - size[0] / 2, y: y + size[1] / 2 },
      { x: x - size[0] / 2, y: y - size[1] / 2 }
    ];
    let currLength = 0;
    let lastP = points[3];
    ctx.moveTo(lastP.x, lastP.y);
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const len = Math.sqrt((p.x - lastP.x) * (p.x - lastP.x) + (p.y - lastP.y) * (p.y - lastP.y));
      if (currLength + len > drawLength) {
        const dx = ((p.x - lastP.x) * (drawLength - currLength)) / len;
        const dy = ((p.y - lastP.y) * (drawLength - currLength)) / len;
        ctx.lineTo(lastP.x + dx, lastP.y + dy);
        break;
      } else {
        ctx.lineTo(p.x, p.y);
      }
      lastP = p;
      currLength += len;
    }
    return false;
  }

  drawOffset(ctx: IContext2d, size: number | [number, number], x: number, y: number, offset: number) {
    if (isNumber(size)) {
      return rectSize(ctx, size + 2 * offset, x, y);
    }
    return rectSizeArray(ctx, [size[0] + 2 * offset, size[1] + 2 * offset], x, y);
  }
}

export default new RectSymbol();
