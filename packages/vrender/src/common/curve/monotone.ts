import { IPointLike, abs } from '@visactor/vutils';
import { genLinearSegments } from './linear';
import { genCurveSegments } from './common';
import { ACurveTypeClass, IGenSegmentParams, ISegPath2D } from './interface';
import { Direction, ReflectSegContext, SegContext } from '../seg-context';

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
// https://github.com/d3/d3-shape/blob/main/src/curve/monotone.js
function sign(x: number): number {
  return x < 0 ? -1 : 1;
}

// Calculate the slopes of the tangents (Hermite-type interpolation) based on
// the following paper: Steffen, M. 1990. A Simple Method for Monotonic
// Interpolation in One Dimension. Astronomy and Astrophysics, Vol. 239, NO.
// NOV(II), P. 443, 1990.
function slope3(curveClass: MonotoneX | MonotoneY, x2: number, y2: number) {
  const h0 = curveClass._x1 - curveClass._x0;
  const h1 = x2 - curveClass._x1;
  const s0 = (curveClass._y1 - curveClass._y0) / (h0 || Number(h1 < 0 && -0));
  const s1 = (y2 - curveClass._y1) / (h1 || Number(h0 < 0 && -0));
  const p = (s0 * h1 + s1 * h0) / (h0 + h1);
  return (sign(s0) + sign(s1)) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(p)) || 0;
}

// Calculate a one-sided slope.
function slope2(curveClass: MonotoneX | MonotoneY, t: number) {
  const h = curveClass._x1 - curveClass._x0;
  return h ? ((3 * (curveClass._y1 - curveClass._y0)) / h - t) / 2 : t;
}

// According to https://en.wikipedia.org/wiki/Cubic_Hermite_spline#Representations
// "you can express cubic Hermite interpolation in terms of cubic Bézier curves
// with respect to the four values p0, p0 + m0 / 3, p1 - m1 / 3, p1".
function point(curveClass: MonotoneX | MonotoneY, t0: number, t1: number, defined: boolean) {
  const x0 = curveClass._x0;
  const y0 = curveClass._y0;
  const x1 = curveClass._x1;
  const y1 = curveClass._y1;
  const dx = (x1 - x0) / 3;
  curveClass.context.bezierCurveTo(x0 + dx, y0 + dx * t0, x1 - dx, y1 - dx * t1, x1, y1, defined);
}

export class MonotoneX extends ACurveTypeClass {
  protected _lastDefined?: boolean;
  declare context: ISegPath2D;
  declare _t0: number;

  protected startPoint?: IPointLike;

  constructor(context: ISegPath2D, startPoint?: IPointLike) {
    super();
    this.context = context;
    this.startPoint = startPoint;
  }

  areaStart() {
    this._line = 0;
  }
  areaEnd() {
    this._line = NaN;
  }
  lineStart() {
    this._x0 = this._x1 = this._y0 = this._y1 = this._t0 = NaN;
    this._point = 0;
    this.startPoint && this.point(this.startPoint);
  }
  lineEnd() {
    switch (this._point) {
      case 2:
        this.context.lineTo(this._x1, this._y1, this._lastDefined !== false);
        break;
      case 3:
        point(this, this._t0, slope2(this, this._t0), this._lastDefined !== false);
        break;
    }
    if (this._line || (this._line !== 0 && this._point === 1)) {
      this.context.closePath();
    }
    this._line = 1 - this._line;
  }
  point(p: IPointLike): void {
    let t1 = NaN;

    const x = p.x;
    const y = p.y;
    if (x === this._x1 && y === this._y1) {
      return;
    } // Ignore coincident points.
    switch (this._point) {
      case 0:
        this._point = 1;
        this._line
          ? this.context.lineTo(x, y, this._lastDefined !== false && p.defined !== false)
          : this.context.moveTo(x, y);
        break;
      case 1:
        this._point = 2;
        break;
      case 2:
        this._point = 3;
        point(this, slope2(this, (t1 = slope3(this, x, y))), t1, this._lastDefined !== false && p.defined !== false);
        break;
      default:
        point(this, this._t0, (t1 = slope3(this, x, y)), this._lastDefined !== false && p.defined !== false);
        break;
    }

    (this._x0 = this._x1), (this._x1 = x);
    (this._y0 = this._y1), (this._y1 = y);
    this._t0 = t1;
    this._lastDefined = p.defined !== false;
  }

  tryUpdateLength(): number {
    return this.context.tryUpdateLength();
  }
}

export class MonotoneY extends MonotoneX {
  declare context: ISegPath2D;

  protected declare startPoint?: IPointLike;

  constructor(context: ISegPath2D, startPoint?: IPointLike) {
    super(context, startPoint);
  }

  point(p: IPointLike): void {
    return super.point({ y: p.x, x: p.y, defined: p.defined } as any);
  }
}

export function genMonotpneXTypeSegments(path: MonotoneX, points: IPointLike[]): void {
  return genCurveSegments(path, points, 2);
}

export function genMonotoneXSegments(points: IPointLike[], params: IGenSegmentParams = {}): SegContext | null {
  const { direction, startPoint } = params;

  if (points.length < 2 - Number(!!startPoint)) {
    return null;
  }
  if (points.length < 3 - Number(!!startPoint)) {
    return genLinearSegments(points, params);
  }
  const segContext = new SegContext(
    'monotoneX',
    direction ??
      (abs(points[points.length - 1].x - points[0].x) > abs(points[points.length - 1].y - points[0].y)
        ? Direction.ROW
        : Direction.COLUMN)
  );
  const monotoneX = new MonotoneX(segContext, startPoint);

  genMonotpneXTypeSegments(monotoneX, points);

  return segContext;
}

export function genMonotpneYTypeSegments(path: MonotoneX, points: IPointLike[]): void {
  return genCurveSegments(path, points, 2);
}

export function genMonotoneYSegments(points: IPointLike[], params: IGenSegmentParams = {}): SegContext | null {
  const { direction, startPoint } = params;
  if (points.length < 2 - Number(!!startPoint)) {
    return null;
  }
  if (points.length < 3 - Number(!!startPoint)) {
    return genLinearSegments(points, params);
  }
  const segContext = new ReflectSegContext(
    'monotoneY',
    direction ??
      (abs(points[points.length - 1].x - points[0].x) > abs(points[points.length - 1].y - points[0].y)
        ? Direction.ROW
        : Direction.COLUMN)
  );
  const monotoneY = new MonotoneY(segContext, startPoint);

  genMonotpneYTypeSegments(monotoneY, points);

  return segContext;
}
