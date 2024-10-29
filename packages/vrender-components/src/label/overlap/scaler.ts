import type { IBoundsLike } from '@visactor/vutils';
import { clamp as clampRange } from '@visactor/vutils';
import { bitmap } from './bitmap';

/**
 * 防重叠逻辑参考 https://github.com/vega/vega/
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

export function bitmapTool(
  width: number,
  height: number,
  padding: { top?: number; left?: number; right?: number; bottom?: number } = { top: 0, left: 0, right: 0, bottom: 0 }
) {
  const { top = 0, left = 0, right = 0, bottom = 0 } = padding;
  const ratio = Math.max(1, Math.sqrt((width * height) / 1e6));
  const w = ~~((width + left + right + ratio) / ratio);
  const h = ~~((height + top + bottom + ratio) / ratio);
  const scale = (_: number) => ~~(_ / ratio);

  scale.bitmap = () => bitmap(w, h);
  scale.x = (_: number) => ~~((_ + left) / ratio);
  scale.y = (_: number) => ~~((_ + top) / ratio);

  scale.ratio = ratio;
  scale.padding = padding;
  scale.width = width;
  scale.height = height;

  return scale;
}

export function clampRangeByBitmap($: BitmapTool, range: IBoundsLike) {
  const { x1, x2, y1, y2 } = range;
  const _x1 = clampRange(x1, 0, $.width);
  const _x2 = clampRange(x2, 0, $.width);
  const _y1 = clampRange(y1, 0, $.height);
  const _y2 = clampRange(y2, 0, $.height);
  return {
    x1: $.x(_x1),
    x2: $.x(_x2),
    y1: $.y(_y1),
    y2: $.y(_y2)
  };
}

export function boundToRange($: BitmapTool, bound: IBoundsLike, clamp: boolean = false) {
  if (clamp) {
    return clampRangeByBitmap($, bound);
  }

  return {
    x1: $.x(bound.x1),
    x2: $.x(bound.x2),
    y1: $.y(bound.y1),
    y2: $.y(bound.y2)
  };
}

export type BitmapTool = ReturnType<typeof bitmapTool>;
