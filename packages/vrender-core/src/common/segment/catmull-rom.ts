import { epsilon, type IPointLike } from '@visactor/vutils';
import { genLinearSegments } from './linear';
import { genCurveSegments, genSegContext } from './common';
import type { ICurvedSegment, IGenSegmentParams, ILinearSegment, ISegPath2D } from '../../interface/curve';
import type { ICurveType } from '../../interface';

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
export function point(curveClass: CatmullRom, x: number, y: number, defined: boolean, p: IPointLike) {
  let x1 = curveClass._x1;
  let y1 = curveClass._y1;
  let x2 = curveClass._x2;
  let y2 = curveClass._y2;

  if (curveClass._l01_a > epsilon) {
    const a = 2 * curveClass._l01_2a + 3 * curveClass._l01_a * curveClass._l12_a + curveClass._l12_2a;
    const n = 3 * curveClass._l01_a * (curveClass._l01_a + curveClass._l12_a);
    x1 = (x1 * a - curveClass._x0 * curveClass._l12_2a + curveClass._x2 * curveClass._l01_2a) / n;
    y1 = (y1 * a - curveClass._y0 * curveClass._l12_2a + curveClass._y2 * curveClass._l01_2a) / n;
  }

  if (curveClass._l23_a > epsilon) {
    const b = 2 * curveClass._l23_2a + 3 * curveClass._l23_a * curveClass._l12_a + curveClass._l12_2a;
    const m = 3 * curveClass._l23_a * (curveClass._l23_a + curveClass._l12_a);
    x2 = (x2 * b + curveClass._x1 * curveClass._l23_2a - x * curveClass._l12_2a) / m;
    y2 = (y2 * b + curveClass._y1 * curveClass._l23_2a - y * curveClass._l12_2a) / m;
  }

  curveClass.context.bezierCurveTo(x1, y1, x2, y2, curveClass._x2, curveClass._y2, defined, curveClass.lastPoint1);
}

export class CatmullRom implements ICurvedSegment {
  private _lastDefined1?: boolean;
  private _lastDefined2?: boolean;
  declare context: ISegPath2D;

  protected startPoint?: IPointLike;
  lastPoint0?: IPointLike;
  lastPoint1?: IPointLike;

  constructor(context: ISegPath2D, alpha: number = 0.5, startPoint?: IPointLike) {
    this.context = context;
    this.startPoint = startPoint;
    this._alpha = alpha;
  }
  _alpha: number;
  _x: number;
  _y: number;
  _x0: number;
  _x1: number;
  _y0: number;
  _y1: number;
  _x2: number;
  _y2: number;
  _line: number;
  _point: number;
  _l01_a: number;
  _l12_a: number;
  _l23_a: number;
  _l01_2a: number;
  _l12_2a: number;
  _l23_2a: number;

  areaStart() {
    this._line = 0;
  }
  areaEnd() {
    this._line = NaN;
  }
  lineStart() {
    this._x0 = this._x1 = this._x2 = this._y0 = this._y1 = this._y2 = NaN;
    this._l01_a = this._l12_a = this._l23_a = this._l01_2a = this._l12_2a = this._l23_2a = this._point = 0;
  }
  lineEnd() {
    switch (this._point) {
      case 2:
        this.context.lineTo(
          this._x2,
          this._y2,
          this._lastDefined1 !== false && this._lastDefined2 !== false,
          this.lastPoint1
        );
        break;
      case 3:
        this.point({ x: this._x2, y: this._y2 });
        break;
    }
    if (this._line || (this._line !== 0 && this._point === 1)) {
      this.context.closePath();
    }
    this._line = 1 - this._line;
  }
  point(p: IPointLike): void {
    const { x, y } = p;

    if (this._point) {
      const x23 = this._x2 - x;
      const y23 = this._y2 - y;
      this._l23_a = Math.sqrt((this._l23_2a = Math.pow(x23 * x23 + y23 * y23, this._alpha)));
    }

    switch (this._point) {
      case 0:
        this._point = 1;
        this._line
          ? this.context.lineTo(x, y, this._lastDefined1 !== false && this._lastDefined2 !== false)
          : this.context.moveTo(x, y);
        break;
      case 1:
        this._point = 2;
        break;
      case 2:
        this._point = 3; // falls through
      default:
        point(this, x, y, this._lastDefined1 !== false && this._lastDefined2 !== false, p);
        break;
    }

    (this._l01_a = this._l12_a), (this._l12_a = this._l23_a);
    (this._l01_2a = this._l12_2a), (this._l12_2a = this._l23_2a);
    (this._x0 = this._x1), (this._x1 = this._x2), (this._x2 = x);
    (this._y0 = this._y1), (this._y1 = this._y2), (this._y2 = y);

    this._lastDefined1 = this._lastDefined2;
    this._lastDefined2 = p.defined;
    this.lastPoint0 = this.lastPoint1;
    this.lastPoint1 = p;
  }

  tryUpdateLength(): number {
    return this.context.tryUpdateLength();
  }
}

// export function genCatmullRomTypeSegments(path: ILinearSegment, points: IPointLike[]): void {
//   return genCurveSegments(path, points, 2);
// }

export function commonGenCatmullRomSegments(type: ICurveType, cons: any) {
  return function genCatmullRomSegments(
    points: IPointLike[],
    alpha: number,
    params: IGenSegmentParams = {}
  ): ISegPath2D | null {
    const { direction, startPoint } = params;
    if (points.length < 2 - Number(!!startPoint)) {
      return null;
    }
    if (points.length < 3 - Number(!!startPoint)) {
      return genLinearSegments(points, params);
    }

    const segContext = genSegContext(type, direction, points);

    const gatmullRom = new cons(segContext, alpha, startPoint);

    genCurveSegments(gatmullRom, points, 2);
    // genCatmullRomTypeSegments(gatmullRom, points);

    return segContext;
  };
}

export const genCatmullRomSegments = commonGenCatmullRomSegments('catmullRom', CatmullRom);

// export function genCatmullRomSegments(
//   points: IPointLike[],
//   alpha: number,
//   params: IGenSegmentParams = {}
// ): ISegPath2D | null {
//   const { direction, startPoint } = params;
//   if (points.length < 2 - Number(!!startPoint)) {
//     return null;
//   }
//   if (points.length < 3 - Number(!!startPoint)) {
//     return genLinearSegments(points, params);
//   }

//   const segContext = genSegContext('catmullRom', direction, points);

//   const gatmullRom = new CatmullRom(segContext, alpha, startPoint);

//   genCatmullRomTypeSegments(gatmullRom, points);

//   return segContext;
// }
