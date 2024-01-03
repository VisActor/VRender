import type { IPointLike } from '@visactor/vutils';
import { genLinearSegments } from './linear';
import { genCurveSegments, genSegContext } from './common';
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
// https://github.com/d3/d3-shape/blob/main/src/curve/basis.js
export function point(curveClass: Basis, x: number, y: number, defined: boolean, p: IPointLike) {
  curveClass.context.bezierCurveTo(
    (2 * curveClass._x0 + curveClass._x1) / 3,
    (2 * curveClass._y0 + curveClass._y1) / 3,
    (curveClass._x0 + 2 * curveClass._x1) / 3,
    (curveClass._y0 + 2 * curveClass._y1) / 3,
    (curveClass._x0 + 4 * curveClass._x1 + x) / 6,
    (curveClass._y0 + 4 * curveClass._y1 + y) / 6,
    defined,
    curveClass.lastPoint1
  );
}

export class Basis implements ICurvedSegment {
  private _lastDefined1?: boolean;
  private _lastDefined2?: boolean;
  declare context: ISegPath2D;

  protected startPoint?: IPointLike;
  lastPoint0?: IPointLike;
  lastPoint1?: IPointLike;

  constructor(context: ISegPath2D, startPoint?: IPointLike) {
    this.context = context;
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
    this._x0 = this._x1 = this._y0 = this._y1 = NaN;
    this._point = 0;
    this.startPoint && this.point(this.startPoint);
  }
  lineEnd() {
    switch (this._point) {
      case 2:
        point(
          this,
          this._x1 * 6 - (this._x0 + 4 * this._x1),
          this._y1 * 6 - (this._y0 + 4 * this._y1),
          this._lastDefined1 !== false && this._lastDefined2 !== false,
          this.lastPoint1
        ); // falls through
      // case 2: this.context.lineTo(this._x1, this._y1); break;
    }
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
          ? this.context.lineTo(x, y, this._lastDefined1 !== false && this._lastDefined2 !== false, p)
          : this.context.moveTo(x, y, p);
        break;
      case 1:
        this._point = 2;
        break;
      // case 2: this._point = 3; this.context.lineTo((5 * this._x0 + this._x1) / 6, (5 * this._y0 + this._y1) / 6, i, defined1, defined2); // falls through
      default:
        point(this, x, y, this._lastDefined1 !== false && this._lastDefined2 !== false, p);
        break;
    }
    (this._x0 = this._x1), (this._x1 = x);
    (this._y0 = this._y1), (this._y1 = y);
    this._lastDefined1 = this._lastDefined2;
    this._lastDefined2 = p.defined;
    this.lastPoint0 = this.lastPoint1;
    this.lastPoint1 = p;
  }

  tryUpdateLength(): number {
    return this.context.tryUpdateLength();
  }
}

export function genBasisTypeSegments(path: ILinearSegment, points: IPointLike[]): void {
  return genCurveSegments(path, points, 2);
}

export function genBasisSegments(points: IPointLike[], params: IGenSegmentParams = {}): ISegPath2D | null {
  const { direction, startPoint } = params;
  if (points.length < 2 - Number(!!startPoint)) {
    return null;
  }
  if (points.length < 3 - Number(!!startPoint)) {
    return genLinearSegments(points, params);
  }

  const segContext = genSegContext('basis', direction, points);

  const basis = new Basis(segContext, startPoint);

  genBasisTypeSegments(basis, points);

  return segContext;
}
