import type { IPointLike } from '@visactor/vutils';
import type { ILinearSegment } from '../../interface/curve';

/**
 * 部分源码参考 https://github.com/d3/d3-shape/
 * Copyright 2010-2022 Mike Bostock

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

/**
 * 公用的绘制curve的方法
 * @param path
 * @param points
 * @param step
 */
export function genCurveSegments(path: ILinearSegment, points: IPointLike[], step: number = 1): void {
  let defined0 = false;
  for (let i = 0, n = points.length; i <= n; i++) {
    if (i >= n === defined0) {
      if ((defined0 = !defined0)) {
        path.lineStart();
      } else {
        path.lineEnd();
      }
    }
    if (defined0) {
      path.point(points[i]);
    }
  }
}
