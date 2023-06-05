import { abs, IPoint, Point } from '@visactor/vutils';
import { ICurve, ICurveType } from '../interface';
import { ISegPath2D } from './curve/interface';
import { CubicBezierCurve, LineCurve } from './path';

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
export enum Direction {
  ROW = 1,
  COLUMN = 2
}

/**
 * 缓存segment的context
 */
export class SegContext implements ISegPath2D {
  private _lastX: number;
  private _lastY: number;
  private _startX: number;
  private _startY: number;

  get endX(): number {
    return this._lastX;
  }
  get endY(): number {
    return this._lastY;
  }

  curves: ICurve<IPoint>[];
  direction: Direction;
  curveType: ICurveType;
  length: number;

  constructor(curveType: ICurveType, direction: Direction) {
    this.init(curveType, direction);
  }

  init(curveType: ICurveType, direction: Direction) {
    this._lastX = this._lastY = this._startX = this._startY = 0;
    this.curveType = curveType;
    this.direction = direction;
    this.curves = [];
  }
  // @ts-ignore
  bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number, defined: boolean): void {
    const curve: CubicBezierCurve = new CubicBezierCurve(
      new Point(this._lastX, this._lastY),
      new Point(cp1x, cp1y),
      new Point(cp2x, cp2y),
      new Point(x, y)
    );
    curve.defined = defined;
    this.curves.push(curve);
    this._lastX = x;
    this._lastY = y;
  }
  closePath(): void {
    if (this.curves.length < 2) {
      return;
    }
    const lastCurve = this.curves[this.curves.length - 1];
    this.lineTo(this._startX, this._startY, lastCurve.defined);
  }
  // @ts-ignore
  ellipse(): void {
    throw new Error('SegContext不支持调用ellipse');
  }
  lineTo(x: number, y: number, defined: boolean): void {
    const curve = this.addLinearCurve(x, y, defined);
    this.curves.push(curve);
    this._lastX = x;
    this._lastY = y;
  }
  moveTo(x: number, y: number): ISegPath2D {
    this._lastX = this._startX = x;
    this._lastY = this._startY = y;
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

  tryUpdateLength(direction?: Direction): number {
    return this.getLength(direction);
  }

  // linear
  protected addLinearCurve(x: number, y: number, defined: boolean): LineCurve {
    const curve = new LineCurve(new Point(this._lastX, this._lastY), new Point(x, y));
    curve.defined = defined;
    return curve;
  }

  getPointAt(t: number): IPoint {
    throw new Error('暂未实现');
  }
  getCurveLengths(): number[] {
    return [];
  }
  getLength(direction?: Direction): number {
    if (direction === Direction.COLUMN) {
      if (!this.curves.length) {
        return 0;
      }
      const sc = this.curves[0];
      const ec = this.curves[this.curves.length - 1];
      return abs(sc.p0.y - ec.p1.y);
    } else if (direction === Direction.ROW) {
      if (!this.curves.length) {
        return 0;
      }
      const sc = this.curves[0];
      const ec = this.curves[this.curves.length - 1];
      return abs(sc.p0.x - ec.p1.x);
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
  bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number, defined: boolean): void {
    return super.bezierCurveTo(cp1y, cp1x, cp2y, cp2x, y, x, defined);
  }
  lineTo(x: number, y: number, defined: boolean): void {
    return super.lineTo(y, x, defined);
  }
  moveTo(x: number, y: number): ISegPath2D {
    return super.moveTo(y, x);
  }
  clear() {
    return super.clear();
  }
}

// export class ReflectContextWrap implements IPath {
//   ctx: IPath;
//   constructor(path: IPath) {
//     this.ctx = path;
//   }

//   // @ts-ignore
//   arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void {
//     return this.ctx.arc(y, x, radius, startAngle, endAngle, counterclockwise);
//   }
//   // @ts-ignore
//   arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void {
//     return this.ctx.arcTo(y1, x1, y2, x2, radius);
//   }
//   // @ts-ignore
//   bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void {
//     return this.ctx.bezierCurveTo(cp1y, cp1x, cp2y, cp2x, y, x);
//   }
//   closePath(): void {
//     return this.ctx.closePath();
//   }
//   // @ts-ignore
//   ellipse(
//     x: number,
//     y: number,
//     radiusX: number,
//     radiusY: number,
//     rotation: number,
//     startAngle: number,
//     endAngle: number,
//     counterclockwise?: boolean
//   ): void {
//     return this.ctx.ellipse(y, x, radiusY, radiusX, rotation, startAngle, endAngle, counterclockwise);
//   }
//   lineTo(x: number, y: number): void {
//     return this.ctx.lineTo(y, x);
//   }
//   moveTo(x: number, y: number): void {
//     return this.ctx.moveTo(y, x);
//   }
//   // @ts-ignore
//   quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void {
//     return this.ctx.quadraticCurveTo(cpy, cpx, y, x);
//   }
//   // @ts-ignore
//   rect(x: number, y: number, w: number, h: number): void {
//     return this.rect(y, x, w, h);
//   }
// }
