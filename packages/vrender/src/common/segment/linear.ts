import { abs, IPointLike } from '@visactor/vutils';
import { SegContext } from '../seg-context';
import { genCurveSegments } from './common';
import { Direction } from '../enums';
import { IGenSegmentParams, ILinearSegment, ISegPath2D } from '../../interface/curve';

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
export class Linear implements ILinearSegment {
  declare context: ISegPath2D;
  private _lastDefined?: boolean;

  protected startPoint?: IPointLike;

  constructor(context: ISegPath2D, startPoint?: IPointLike) {
    this.context = context;
    startPoint && (this.startPoint = startPoint);
  }
  _x: number;
  _y: number;
  _x0: number;
  _x1: number;
  _y0: number;
  _y1: number;
  _line: number;
  _point: number;

  areaStart() {
    this._line = 0;
  }
  areaEnd() {
    this._line = NaN;
  }
  lineStart() {
    this._point = 0;
    this.startPoint && this.point(this.startPoint);
  }
  lineEnd() {
    if (this._line || (this._line !== 0 && this._point === 1)) {
      this.context.closePath();
    }
    this._line = 1 - this._line;
  }
  point(p: IPointLike): void {
    const x = p.x;
    const y = p.y;
    switch (this._point) {
      case 0:
        this._point = 1;
        this._line
          ? this.context.lineTo(x, y, this._lastDefined !== false && p.defined !== false)
          : this.context.moveTo(x, y);
        break;
      case 1:
        this._point = 2; // falls through
      default:
        this.context.lineTo(x, y, this._lastDefined !== false && p.defined !== false);
        break;
    }

    this._lastDefined = p.defined;
  }

  tryUpdateLength(): number {
    return this.context.tryUpdateLength();
  }
}

export function genLinearSegments(points: IPointLike[], params: IGenSegmentParams = {}): ISegPath2D | null {
  const { direction, startPoint } = params;
  if (points.length < 2 - Number(!!startPoint)) {
    return null;
  }

  const segContext = new SegContext(
    'linear',
    direction ??
      (abs(points[points.length - 1].x - points[0].x) > abs(points[points.length - 1].y - points[0].y)
        ? Direction.ROW
        : Direction.COLUMN)
  );
  const linear = new Linear(segContext, startPoint);

  genLinearTypeSegments(linear, points);

  return segContext;
}

export function genLinearTypeSegments(path: ILinearSegment, points: IPointLike[]): void {
  return genCurveSegments(path, points, 1);
}
