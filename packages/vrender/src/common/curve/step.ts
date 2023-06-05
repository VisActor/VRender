import { IPointLike, abs } from '@visactor/vutils';
import { Direction, SegContext } from '../seg-context';
import { genCurveSegments } from './common';
import { ACurveTypeClass, ALinearTypeClass, IGenSegmentParams, ISegPath2D } from './interface';

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

// 基于d3-shape重构
// https://github.com/d3/d3-shape/blob/main/src/curve/step.js
export class Step extends ACurveTypeClass {
  declare context: ISegPath2D;
  declare _t: number;
  private _lastDefined?: boolean;

  protected startPoint?: IPointLike;

  constructor(context: ISegPath2D, t: number = 0.5, startPoint?: IPointLike) {
    super();
    this.context = context;
    this._t = t;
    this.startPoint = startPoint;
  }

  areaStart() {
    this._line = 0;
  }
  areaEnd() {
    this._line = NaN;
  }
  lineStart() {
    this._x = this._y = NaN;
    this._point = 0;
    this.startPoint && this.point(this.startPoint);
  }
  lineEnd() {
    if (0 < this._t && this._t < 1 && this._point === 2) {
      this.context.lineTo(this._x, this._y, this._lastDefined !== false);
    }
    if (this._line || (this._line !== 0 && this._point === 1)) {
      this.context.closePath();
    }
    if (this._line >= 0) {
      (this._t = 1 - this._t), (this._line = 1 - this._line);
    }
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
      default: {
        if (this._t <= 0) {
          this.context.lineTo(this._x, y, this._lastDefined !== false && p.defined !== false);
          this.context.lineTo(x, y, this._lastDefined !== false && p.defined !== false);
        } else {
          const x1 = this._x * (1 - this._t) + x * this._t;
          this.context.lineTo(x1, this._y, this._lastDefined !== false && p.defined !== false);
          this.context.lineTo(x1, y, this._lastDefined !== false && p.defined !== false);
        }
        break;
      }
    }
    this._lastDefined = p.defined;
    (this._x = x), (this._y = y);
  }

  tryUpdateLength(): number {
    return this.context.tryUpdateLength();
  }
}

export function genStepSegments(points: IPointLike[], t: number, params: IGenSegmentParams = {}): SegContext | null {
  const { direction, startPoint } = params;
  if (points.length < 2 - Number(!!startPoint)) {
    return null;
  }
  const segContext = new SegContext(
    'step',
    direction ??
      (abs(points[points.length - 1].x - points[0].x) > abs(points[points.length - 1].y - points[0].y)
        ? Direction.ROW
        : Direction.COLUMN)
  );
  const step = new Step(segContext, t, startPoint);

  genStepTypeSegments(step, points);

  return segContext;
}

export function genStepTypeSegments(path: ALinearTypeClass, points: IPointLike[]): void {
  return genCurveSegments(path, points, 1);
}
