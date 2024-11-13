import type { IBounds } from '@visactor/vutils';
import { sqrt } from '@visactor/vutils';
import type { IContext2d, ISymbolClass, SymbolType } from '../../interface';
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

const sqrt3 = sqrt(3);

export function arrow(ctx: IContext2d, r: number, transX: number, transY: number) {
  const triangleH = r;
  const trangleBottomSide = triangleH / sqrt3;
  const rectW = trangleBottomSide / 5;
  const rectH = r;
  //从箭头顶部为起点 顺时针依次移动绘制路径
  ctx.moveTo(0 + transX, -triangleH + transY);
  ctx.lineTo(trangleBottomSide / 2 + transX, transY);

  ctx.lineTo(rectW / 2 + transX, transY);
  ctx.lineTo(rectW / 2 + transX, rectH + transY);
  ctx.lineTo(-rectW / 2 + transX, rectH + transY);
  ctx.lineTo(-rectW / 2 + transX, transY);

  ctx.lineTo(-trangleBottomSide / 2 + transX, transY);
  ctx.closePath();
  return true;
}

// 以中心为锚点，size为circle外接正方形的面积
export class ArrowSymbol extends BaseSymbol implements ISymbolClass {
  type: SymbolType = 'arrow';
  /* eslint-disable max-len */
  pathStr: string =
    'M-0.07142857142857142,0.5L0.07142857142857142,0.5L0.07142857142857142,-0.0625L0.2,-0.0625L0,-0.5L-0.2,-0.0625L-0.07142857142857142,-0.0625Z';

  draw(ctx: IContext2d, size: number, transX: number, transY: number) {
    const r = this.parseSize(size) / 2;
    return arrow(ctx, r, transX, transY);
  }

  drawOffset(ctx: IContext2d, size: number, transX: number, transY: number, offset: number) {
    const r = this.parseSize(size) / 2 + offset;
    return arrow(ctx, r, transX, transY);
  }
}

export default new ArrowSymbol();
