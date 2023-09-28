import type { IBounds } from '@visactor/vutils';
import { isNumber } from '@visactor/vutils';
import type { IContext2d, SymbolType, ISymbolClass } from '../../interface';
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

export function rect(ctx: IContext2d, size: [number, number], x: number, y: number) {
  ctx.rect(x - size[0] / 2, y - size[1] / 2, size[0], size[1]);
  return false;
}

// 以中心为锚点，size为circle外接正方形的面积
export class RectSymbol extends BaseSymbol implements ISymbolClass {
  type: SymbolType = 'rect';
  pathStr: string = 'M-0.5,-0.5h1v1h-1Z';

  draw(ctx: IContext2d, size: number | [number, number], x: number, y: number) {
    const rectSize: [number, number] = isNumber(size) ? [size, size] : size;
    return rect(ctx, rectSize, x, y);
  }

  drawOffset(ctx: IContext2d, size: number | [number, number], x: number, y: number, offset: number) {
    const rectSize: [number, number] = isNumber(size)
      ? [size + 2 * offset, size + 2 * offset]
      : [size[0] + 2 * offset, size[1] + 2 * offset];
    return rect(ctx, rectSize, x, y);
  }
}

export default new RectSymbol();
