import { IBoundsLike } from '@visactor/vutils';

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

const DIV = 5; // bit shift from x, y index to bit vector array index
const MOD = 31; // bit mask for index lookup within a bit vector
const SIZE = 32; // individual bit vector size
const RIGHT0 = new Uint32Array(SIZE + 1); // left-anchored bit vectors, full -> 0
const RIGHT1 = new Uint32Array(SIZE + 1); // right-anchored bit vectors, 0 -> full

RIGHT1[0] = 0;
RIGHT0[0] = ~RIGHT1[0];
for (let i = 1; i <= SIZE; ++i) {
  RIGHT1[i] = (RIGHT1[i - 1] << 1) | 1;
  RIGHT0[i] = ~RIGHT1[i];
}

export function bitmap(w: number, h: number) {
  const array = new Uint32Array(~~((w * h + SIZE) / SIZE));

  function _set(index: number, mask: number) {
    array[index] |= mask;
  }

  function _clear(index: number, mask: number) {
    array[index] &= mask;
  }

  return {
    array: array,

    get: (x: number, y: number) => {
      const index = y * w + x;
      return array[index >>> DIV] & (1 << (index & MOD));
    },

    set: (x: number, y: number) => {
      const index = y * w + x;
      _set(index >>> DIV, 1 << (index & MOD));
    },

    clear: (x: number, y: number) => {
      const index = y * w + x;
      _clear(index >>> DIV, ~(1 << (index & MOD)));
    },
    /**
     * 给定范围内是否发生碰撞
     * @param 范围
     * @returns boolean
     */
    getRange: ({ x1, y1, x2, y2 }: IBoundsLike) => {
      let r = y2;
      let start;
      let end;
      let indexStart;
      let indexEnd;
      for (; r >= y1; --r) {
        start = r * w + x1;
        end = r * w + x2;
        indexStart = start >>> DIV;
        indexEnd = end >>> DIV;
        if (indexStart === indexEnd) {
          if (array[indexStart] & RIGHT0[start & MOD] & RIGHT1[(end & MOD) + 1]) {
            return true;
          }
        } else {
          if (array[indexStart] & RIGHT0[start & MOD]) {
            return true;
          }
          if (array[indexEnd] & RIGHT1[(end & MOD) + 1]) {
            return true;
          }
          for (let i = indexStart + 1; i < indexEnd; ++i) {
            if (array[i]) {
              return true;
            }
          }
        }
      }
      return false;
    },

    setRange: ({ x1, y1, x2, y2 }: IBoundsLike) => {
      let start;
      let end;
      let indexStart;
      let indexEnd;
      let i;
      for (; y1 <= y2; ++y1) {
        start = y1 * w + x1;
        end = y1 * w + x2;
        indexStart = start >>> DIV;
        indexEnd = end >>> DIV;
        if (indexStart === indexEnd) {
          _set(indexStart, RIGHT0[start & MOD] & RIGHT1[(end & MOD) + 1]);
        } else {
          _set(indexStart, RIGHT0[start & MOD]);
          _set(indexEnd, RIGHT1[(end & MOD) + 1]);
          for (i = indexStart + 1; i < indexEnd; ++i) {
            _set(i, 0xffffffff);
          }
        }
      }
    },

    clearRange: ({ x1, y1, x2, y2 }: IBoundsLike) => {
      let start;
      let end;
      let indexStart;
      let indexEnd;
      let i;
      for (; y1 <= y2; ++y1) {
        start = y1 * w + x1;
        end = y1 * w + x2;
        indexStart = start >>> DIV;
        indexEnd = end >>> DIV;
        if (indexStart === indexEnd) {
          _clear(indexStart, RIGHT1[start & MOD] | RIGHT0[(end & MOD) + 1]);
        } else {
          _clear(indexStart, RIGHT1[start & MOD]);
          _clear(indexEnd, RIGHT0[(end & MOD) + 1]);
          for (i = indexStart + 1; i < indexEnd; ++i) {
            _clear(i, 0);
          }
        }
      }
    },

    outOfBounds: ({ x1, y1, x2, y2 }: IBoundsLike) => x1 < 0 || y1 < 0 || y2 >= h || x2 >= w,
    toImageData: (ctx: CanvasRenderingContext2D) => {
      const imageData = ctx.createImageData(w, h);
      const data = imageData.data;
      for (let y = 0; y < h; ++y) {
        for (let x = 0; x < w; ++x) {
          const index = y * w + x;
          const offset = 4 * index;
          const occupied = array[index >>> DIV] & (1 << (index & MOD));
          data[offset + 0] = occupied * 0xff;
          data[offset + 1] = occupied * 0xff;
          data[offset + 2] = occupied * 0xff;
          data[offset + 3] = 0x1f; // alpha
        }
      }
      return imageData;
    }
  };
}

export type Bitmap = ReturnType<typeof bitmap>;
