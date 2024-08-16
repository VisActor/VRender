import type { IPoint, IPointLike } from '@visactor/vutils';
import { abs, Point } from '@visactor/vutils';
import type { ICubicBezierCurve, ICurve, ICurveType, IDirection, ILineCurve, ISegPath2D } from '../interface';
import { Direction } from './enums';
import { CubicBezierCurve } from './segment/curve/cubic-bezier';
import { LineCurve } from './segment/curve/line';

/**
 * 部分逻辑参考d3-shape：https://github.com/d3/d3-shape/blob/8ec82658454750cfa29efb1e0ea514e3dd9b2297/src/curve/monotone.js
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
 * 缓存segment的context
 */
export class SegContext implements ISegPath2D {
  private _lastX: number;
  private _lastY: number;
  private _startX: number;
  private _startY: number;
  private _lastOriginP?: IPointLike;
  private _startOriginP?: IPointLike;

  get endX(): number {
    return this._lastX;
  }
  get endY(): number {
    return this._lastY;
  }

  curves: ICurve<IPoint>[];
  direction: IDirection;
  curveType: ICurveType;
  length: number;

  constructor(curveType: ICurveType, direction: IDirection) {
    this.init(curveType, direction);
  }

  init(curveType: ICurveType, direction: IDirection) {
    this._lastX = this._lastY = this._startX = this._startY = 0;
    this.curveType = curveType;
    this.direction = direction;
    this.curves = [];
  }
  // @ts-ignore
  bezierCurveTo(
    cp1x: number,
    cp1y: number,
    cp2x: number,
    cp2y: number,
    x: number,
    y: number,
    defined: boolean,
    p: IPointLike
  ): void {
    const curve: ICubicBezierCurve = new CubicBezierCurve(
      new Point(this._lastX, this._lastY),
      new Point(cp1x, cp1y),
      new Point(cp2x, cp2y),
      new Point(x, y)
    );
    curve.originP1 = this._lastOriginP;
    curve.originP2 = p;
    curve.defined = defined;
    this.curves.push(curve);
    this._lastX = x;
    this._lastY = y;
    this._lastOriginP = p;
  }
  closePath(): void {
    if (this.curves.length < 2) {
      return;
    }
    const lastCurve = this.curves[this.curves.length - 1];
    this.lineTo(this._startX, this._startY, lastCurve.defined, this._startOriginP);
  }
  // @ts-ignore
  ellipse(): void {
    throw new Error('SegContext不支持调用ellipse');
  }
  lineTo(x: number, y: number, defined: boolean, p: IPointLike): void {
    const curve = this.addLinearCurve(x, y, defined, this._lastOriginP, p);
    this.curves.push(curve);
    this._lastX = x;
    this._lastY = y;
    this._lastOriginP = p;
  }
  moveTo(x: number, y: number, p: IPointLike): ISegPath2D {
    this._lastX = this._startX = x;
    this._lastY = this._startY = y;
    this._lastOriginP = p;
    this._startOriginP = p;
    return this;
  }
  // @ts-ignore
  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void {
    throw new Error('SegContext不支持调用quadraticCurveTo');
  }

  clear() {
    this.curves = [];
    this.length = NaN;
  }

  tryUpdateLength(direction?: IDirection): number {
    return this.getLength(direction);
  }

  // linear
  protected addLinearCurve(x: number, y: number, defined: boolean, p1: IPointLike, p2: IPointLike): ILineCurve {
    const curve = new LineCurve(new Point(this._lastX, this._lastY), new Point(x, y));
    curve.originP1 = p1;
    curve.originP2 = p2;
    curve.defined = defined;
    return curve;
  }

  getPointAt(t: number): IPoint {
    throw new Error('暂未实现');
  }
  getCurveLengths(): number[] {
    return [];
  }
  getLength(direction?: IDirection): number {
    if (direction === Direction.COLUMN) {
      if (!this.curves.length) {
        return 0;
      }
      const sc = this.curves[0];
      const ec = this.curves[this.curves.length - 1];
      const endP = ec.p3 ?? ec.p1;
      return abs(sc.p0.y - endP.y);
    } else if (direction === Direction.ROW) {
      if (!this.curves.length) {
        return 0;
      }
      const sc = this.curves[0];
      const ec = this.curves[this.curves.length - 1];
      const endP = ec.p3 ?? ec.p1;
      return abs(sc.p0.x - endP.x);
    }
    if (Number.isFinite(this.length)) {
      return this.length;
    }
    this.length = this.curves.reduce((l, c) => l + c.getLength(), 0);
    return this.length;
  }
}

/**
 * 用于monotoneY等类型的segment
 */
export class ReflectSegContext extends SegContext {
  // @ts-ignore
  bezierCurveTo(
    cp1x: number,
    cp1y: number,
    cp2x: number,
    cp2y: number,
    x: number,
    y: number,
    defined: boolean,
    p: IPointLike
  ): void {
    return super.bezierCurveTo(cp1y, cp1x, cp2y, cp2x, y, x, defined, p);
  }
  lineTo(x: number, y: number, defined: boolean, p: IPointLike): void {
    return super.lineTo(y, x, defined, p);
  }
  moveTo(x: number, y: number, p: IPointLike): ISegPath2D {
    return super.moveTo(y, x, p);
  }
  clear() {
    return super.clear();
  }
}
