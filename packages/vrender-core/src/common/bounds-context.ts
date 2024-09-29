import type { IBounds } from '@visactor/vutils';
import { halfPi, tau } from '@visactor/vutils';
import type { IPath2D } from '../interface';

const circleThreshold = tau - 1e-8;

/**
 * 借鉴 https://github.com/vega/vega/blob/b45cf431cd6c0d0c0e1567f087f9b3b55bc236fa/packages/vega-scenegraph/src/bound/boundContext.js
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
export class BoundsContext implements IPath2D {
  bounds: IBounds;
  constructor(bounds: IBounds) {
    this.init(bounds);
  }

  init(bounds: IBounds) {
    this.bounds = bounds;
  }

  // @ts-ignore
  arc(cx: number, cy: number, r: number, sa: number, ea: number, ccw: boolean) {
    if (Math.abs(ea - sa) > circleThreshold) {
      this.bounds.add(cx - r, cy - r);
      this.bounds.add(cx + r, cy + r);
      return;
    }

    let xmin = Infinity;
    let xmax = -Infinity;
    let ymin = Infinity;
    let ymax = -Infinity;
    let s;
    let i;
    let x;
    let y;

    function update(a: number) {
      x = r * Math.cos(a);
      y = r * Math.sin(a);
      if (x < xmin) {
        xmin = x;
      }
      if (x > xmax) {
        xmax = x;
      }
      if (y < ymin) {
        ymin = y;
      }
      if (y > ymax) {
        ymax = y;
      }
    }

    // Sample end points and interior points aligned with 90 degrees
    update(sa);
    update(ea);

    if (ea !== sa) {
      sa = sa % tau;
      if (sa < 0) {
        sa += tau;
      }
      ea = ea % tau;
      if (ea < 0) {
        ea += tau;
      }

      if (ea < sa) {
        ccw = !ccw; // flip direction
        s = sa;
        sa = ea;
        ea = s; // swap end-points
      }

      if (ccw) {
        ea -= tau;
        s = sa - (sa % halfPi);
        for (i = 0; i < 4 && s > ea; ++i, s -= halfPi) {
          update(s);
        }
      } else {
        s = sa - (sa % halfPi) + halfPi;
        for (i = 0; i < 4 && s < ea; ++i, s = s + halfPi) {
          update(s);
        }
      }
    }

    this.bounds.add(cx + xmin, cy + ymin);
    this.bounds.add(cx + xmax, cy + ymax);
  }
  // @ts-ignore
  arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void {
    // 主要用于绘制圆角的场景，暂时只算第一个控制点
    this.bounds.add(x1, y1);
    // this.bounds.add(x2, y2);
  }
  // @ts-ignore
  bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void {
    this.bounds.add(cp1x, cp1y);
    this.bounds.add(cp2x, cp2y);
    this.bounds.add(x, y);
  }
  // @ts-ignore
  closePath(): void {
    // do nothing
  }
  // @ts-ignore
  ellipse(): void {
    throw new Error('不支持ellipse');
  }
  // @ts-ignore
  lineTo(x: number, y: number): void {
    this.bounds.add(x, y);
  }
  // @ts-ignore
  moveTo(x: number, y: number): void {
    this.bounds.add(x, y);
  }
  // @ts-ignore
  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void {
    this.bounds.add(cpx, cpy);
    this.bounds.add(x, y);
  }
  // @ts-ignore
  rect(x: number, y: number, w: number, h: number): void {
    this.bounds.add(x, y);
    this.bounds.add(x + w, y + h);
  }

  clear() {
    this.bounds.clear();
  }

  release(...params: any): void {
    // 不需要dispose
    return;
  }
}
