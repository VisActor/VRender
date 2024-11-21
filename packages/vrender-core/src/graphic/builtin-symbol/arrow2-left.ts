import type { IBounds } from '@visactor/vutils';
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

export function arrow2Left(ctx: IContext2d, r: number, transX: number, transY: number) {
  const r2 = r * 2;
  ctx.moveTo(r + transX, transY - r2);
  ctx.lineTo(transX - r, transY);
  ctx.lineTo(r + transX, r2 + transY);

  return true;
}

// 以中心为锚点，size为circle外接正方形的面积
export class Arrow2LeftSymbol extends BaseSymbol implements ISymbolClass {
  type: SymbolType = 'arrow2Left';
  /* eslint-disable max-len */
  pathStr: string = 'M 0.25 -0.5 L -0.25 0 l 0.25 0.5';

  draw(ctx: IContext2d, size: number, transX: number, transY: number) {
    const r = this.parseSize(size) / 4;
    return arrow2Left(ctx, r, transX, transY);
  }

  drawOffset(ctx: IContext2d, size: number, transX: number, transY: number, offset: number) {
    const r = this.parseSize(size) / 4 + offset;
    return arrow2Left(ctx, r, transX, transY);
  }
}

export default new Arrow2LeftSymbol();
