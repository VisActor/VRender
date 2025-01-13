import type { IPointLike } from '@visactor/vutils';
import { abs } from '@visactor/vutils';
import { SegContext } from '../seg-context';
import { genCurveSegments } from './common';
import { Direction } from '../enums';
import type { ICurvedSegment, IGenSegmentParams, ILinearSegment, ISegPath2D } from '../../interface/curve';

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
export class Step implements ICurvedSegment {
  declare context: ISegPath2D;
  declare _t: number;
  private _lastDefined?: boolean;

  protected startPoint?: IPointLike;
  protected lastPoint?: IPointLike;

  constructor(context: ISegPath2D, t: number = 0.5, startPoint?: IPointLike) {
    this.context = context;
    this._t = t;
    this.startPoint = startPoint;
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
    this._x = this._y = NaN;
    this._point = 0;
    this.startPoint && this.point(this.startPoint);
  }
  lineEnd() {
    if (0 < this._t && this._t < 1 && this._point === 2) {
      this.context.lineTo(this._x, this._y, this._lastDefined !== false, this.lastPoint);
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
          ? this.context.lineTo(x, y, this._lastDefined !== false && p.defined !== false, p)
          : this.context.moveTo(x, y, p);
        break;
      case 1:
        this._point = 2; // falls through
      default: {
        if (this._t <= 0) {
          this.context.lineTo(this._x, y, this._lastDefined !== false && p.defined !== false, this.lastPoint);
          this.context.lineTo(x, y, this._lastDefined !== false && p.defined !== false, p);
        } else {
          const x1 = this._x * (1 - this._t) + x * this._t;
          if (this._t === 0.5) {
            this.context.lineTo(x1, this._y, this._lastDefined !== false, this.lastPoint);
          } else {
            this.context.lineTo(x1, this._y, this._lastDefined !== false && p.defined !== false, this.lastPoint);
          }
          this.context.lineTo(x1, y, this._lastDefined !== false && p.defined !== false, p);
        }
        break;
      }
    }
    this._lastDefined = p.defined;
    (this._x = x), (this._y = y);
    this.lastPoint = p;
  }

  tryUpdateLength(): number {
    return this.context.tryUpdateLength();
  }
}

export function genStepSegments(points: IPointLike[], t: number, params: IGenSegmentParams = {}): ISegPath2D | null {
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

export function genStepTypeSegments(path: ILinearSegment, points: IPointLike[]): void {
  return genCurveSegments(path, points, 1);
}
