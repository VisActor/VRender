import { IBoundsLike } from '@visactor/vutils';
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

export function bitmapTool(width: number, height: number, padding = 0) {
  const ratio = Math.max(1, Math.sqrt((width * height) / 1e6));
  const w = ~~((width + 2 * padding + ratio) / ratio);
  const h = ~~((height + 2 * padding + ratio) / ratio);
  const scale = (_: number) => ~~((_ + padding) / ratio);

  scale.invert = (_: number) => _ * ratio - padding;
  scale.bitmap = () => bitmap(w, h);
  scale.ratio = ratio;
  scale.padding = padding;
  scale.width = width;
  scale.height = height;

  return scale;
}

export function boundToRange($: BitmapTool, bound: IBoundsLike) {
  return {
    x1: $(bound.x1),
    x2: $(bound.x2),
    y1: $(bound.y1),
    y2: $(bound.y2)
  };
}

export type BitmapTool = ReturnType<typeof bitmapTool>;
