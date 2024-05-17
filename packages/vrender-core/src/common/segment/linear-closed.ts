import type { IPointLike } from '@visactor/vutils';
import { genCurveSegments, genSegContext } from './common';
import type { IGenSegmentParams, ILinearSegment, ISegPath2D } from '../../interface/curve';
import { Linear } from './linear';

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

// 基于d3-shape重构，定义绘制线段的方法
// https://github.com/d3/d3-shape/blob/main/src/curve/linear.js
export class LinearClosed extends Linear implements ILinearSegment {
  declare context: ISegPath2D;

  protected declare startPoint?: IPointLike;

  lineEnd() {
    this.context.closePath();
  }
}

export function genLinearClosedSegments(points: IPointLike[], params: IGenSegmentParams = {}): ISegPath2D | null {
  const { direction, startPoint } = params;
  if (points.length < 2 - Number(!!startPoint)) {
    return null;
  }

  const segContext = genSegContext('linear', direction, points);

  const linear = new LinearClosed(segContext, startPoint);

  genLinearClosedTypeSegments(linear, points);

  return segContext;
}

export function genLinearClosedTypeSegments(path: ILinearSegment, points: IPointLike[]): void {
  return genCurveSegments(path, points, 1);
}
