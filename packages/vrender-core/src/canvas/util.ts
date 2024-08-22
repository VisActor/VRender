import type { IPointLike, vec2 } from '@visactor/vutils';
import { isPointInLine, pi, pi2 } from '@visactor/vutils';
import { enumCommandMap as CMD } from '../common/path-svg';
import type { CommandType, IContext2d } from '../interface';
import { container } from '../container';
import { application } from '../application';
import { CanvasFactory, Context2dFactory } from './constants';
import type { CanvasConfigType, ICanvas, ICanvasFactory, IContext2dFactory } from '../interface';

export function wrapCanvas(params: CanvasConfigType) {
  return container.getNamed<ICanvasFactory>(CanvasFactory, application.global.env)(params);
}

export function wrapContext(canvas: ICanvas, dpr: number) {
  return container.getNamed<IContext2dFactory>(Context2dFactory, application.global.env)(canvas, dpr);
}
// 源码参考 http://pomax.github.io/bezierinfo/#projections
/**
 * 源码参考zrender https://github.com/ecomfe/zrender/
 * BSD 3-Clause License

  Copyright (c) 2017, Baidu Inc.
  All rights reserved.

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.

  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation
    and/or other materials provided with the distribution.

  * Neither the name of the copyright holder nor the names of its
    contributors may be used to endorse or promote products derived from
    this software without specific prior written permission.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
  DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
  FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
  DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
  SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
  CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
  OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
  OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

// todo: 优化逻辑

const EPSILON_NUMERIC = 1e-4;

const THREE_SQRT = Math.sqrt(3);
const ONE_THIRD = 1 / 3;
function isAroundZero(val: number) {
  return val > -EPSILON && val < EPSILON;
}
function isNotAroundZero(val: number) {
  return val > EPSILON || val < -EPSILON;
}
export function vec2Equals(d1: vec2, d2: vec2): boolean {
  return Math.abs(d1[0] - d2[0]) + Math.abs(d1[1] - d2[1]) < 1e-10;
}

export function isNumber(data: any): boolean {
  return typeof data === 'number' && Number.isFinite(data);
}

const _v0: [number, number] = [0, 0];
const _v1: [number, number] = [0, 0];
const _v2: [number, number] = [0, 0];

function distanceSquare(v1: [number, number], v2: [number, number]): number {
  return (v1[0] - v2[0]) * (v1[0] - v2[0]) + (v1[1] - v2[1]) * (v1[1] - v2[1]);
}

/**
 * 计算二次方贝塞尔值
 */
export function quadraticAt(p0: number, p1: number, p2: number, t: number): number {
  const onet = 1 - t;
  return onet * (onet * p0 + 2 * t * p1) + t * t * p2;
}

/**
 * 计算三次贝塞尔值
 */
export function cubicAt(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const onet = 1 - t;
  return onet * onet * (onet * p0 + 3 * t * p1) + t * t * (t * p3 + 3 * onet * p2);
}

/**
 * 计算二次方贝塞尔方程根
 * @return 有效根数目
 */
export function quadraticRootAt(p0: number, p1: number, p2: number, val: number, roots: number[]): number {
  const a = p0 - 2 * p1 + p2;
  const b = 2 * (p1 - p0);
  const c = p0 - val;

  let n = 0;
  if (isAroundZero(a)) {
    if (isNotAroundZero(b)) {
      const t1 = -c / b;
      if (t1 >= 0 && t1 <= 1) {
        roots[n++] = t1;
      }
    }
  } else {
    const disc = b * b - 4 * a * c;
    if (isAroundZero(disc)) {
      const t1 = -b / (2 * a);
      if (t1 >= 0 && t1 <= 1) {
        roots[n++] = t1;
      }
    } else if (disc > 0) {
      const discSqrt = Math.sqrt(disc);
      const t1 = (-b + discSqrt) / (2 * a);
      const t2 = (-b - discSqrt) / (2 * a);
      if (t1 >= 0 && t1 <= 1) {
        roots[n++] = t1;
      }
      if (t2 >= 0 && t2 <= 1) {
        roots[n++] = t2;
      }
    }
  }
  return n;
}

/**
 * 计算二次贝塞尔方程极限值
 */
export function quadraticExtremum(p0: number, p1: number, p2: number): number {
  const divider = p0 + p2 - 2 * p1;
  if (divider === 0) {
    // p1 is center of p0 and p2
    return 0.5;
  }

  return (p0 - p1) / divider;
}

/**
 * 投射点到二次贝塞尔曲线上，返回投射距离。
 * 投射点有可能会有一个或者多个，这里只返回其中距离最短的一个。
 * @param {number} x0
 * @param {number} y0
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @param {number} x
 * @param {number} y
 * @param {Array.<number>} out 投射点
 * @return {number}
 */
export function quadraticProjectPoint(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x: number,
  y: number,
  out: [number, number] | null
): number {
  // http://pomax.github.io/bezierinfo/#projections
  let t: number = 0;
  let interval = 0.005;
  let d = Infinity;

  _v0[0] = x;
  _v0[1] = y;

  // 先粗略估计一下可能的最小距离的 t 值
  // PENDING
  for (let _t = 0; _t < 1; _t += 0.05) {
    _v1[0] = quadraticAt(x0, x1, x2, _t);
    _v1[1] = quadraticAt(y0, y1, y2, _t);
    const d1 = distanceSquare(_v0, _v1);
    if (d1 < d) {
      t = _t;
      d = d1;
    }
  }
  d = Infinity;

  // At most 32 iteration
  for (let i = 0; i < 32; i++) {
    if (interval < EPSILON_NUMERIC) {
      break;
    }
    const prev = t - interval;
    const next = t + interval;
    // t - interval
    _v1[0] = quadraticAt(x0, x1, x2, prev);
    _v1[1] = quadraticAt(y0, y1, y2, prev);

    const d1 = distanceSquare(_v1, _v0);

    if (prev >= 0 && d1 < d) {
      t = prev;
      d = d1;
    } else {
      // t + interval
      _v2[0] = quadraticAt(x0, x1, x2, next);
      _v2[1] = quadraticAt(y0, y1, y2, next);
      const d2 = distanceSquare(_v2, _v0);
      if (next <= 1 && d2 < d) {
        t = next;
        d = d2;
      } else {
        interval *= 0.5;
      }
    }
  }
  // t
  if (out) {
    out[0] = quadraticAt(x0, x1, x2, t);
    out[1] = quadraticAt(y0, y1, y2, t);
  }

  return Math.sqrt(d);
}

/**
 * 投射点到三次贝塞尔曲线上，返回投射距离。
 * 投射点有可能会有一个或者多个，这里只返回其中距离最短的一个。
 */
export function cubicProjectPoint(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  x: number,
  y: number,
  out: [number, number] | null
): number {
  // http://pomax.github.io/bezierinfo/#projections
  let t: number = 0;
  let interval = 0.005;
  let d = Infinity;
  let prev;
  let next;
  let d1;
  let d2;

  _v0[0] = x;
  _v0[1] = y;

  // 先粗略估计一下可能的最小距离的 t 值
  // PENDING
  for (let _t = 0; _t < 1; _t += 0.05) {
    _v1[0] = cubicAt(x0, x1, x2, x3, _t);
    _v1[1] = cubicAt(y0, y1, y2, y3, _t);
    d1 = distanceSquare(_v0, _v1);
    if (d1 < d) {
      t = _t;
      d = d1;
    }
  }
  d = Infinity;

  // At most 32 iteration
  for (let i = 0; i < 32; i++) {
    if (interval < EPSILON_NUMERIC) {
      break;
    }
    prev = t - interval;
    next = t + interval;
    // t - interval
    _v1[0] = cubicAt(x0, x1, x2, x3, prev);
    _v1[1] = cubicAt(y0, y1, y2, y3, prev);

    d1 = distanceSquare(_v1, _v0);

    if (prev >= 0 && d1 < d) {
      t = prev;
      d = d1;
    } else {
      // t + interval
      _v2[0] = cubicAt(x0, x1, x2, x3, next);
      _v2[1] = cubicAt(y0, y1, y2, y3, next);
      d2 = distanceSquare(_v2, _v0);

      if (next <= 1 && d2 < d) {
        t = next;
        d = d2;
      } else {
        interval *= 0.5;
      }
    }
  }
  // t
  if (out) {
    out[0] = cubicAt(x0, x1, x2, x3, t);
    out[1] = cubicAt(y0, y1, y2, y3, t);
  }
  // console.log(interval, i);
  return Math.sqrt(d);
}

// 基于zrender
// https://github.com/ecomfe/zrender/blob/master/src/contain/util.ts
export function normalizeRadian(angle: number): number {
  angle %= pi2;
  if (angle < 0) {
    angle += pi2;
  }
  return angle;
}

// 基于zrender
// https://github.com/ecomfe/zrender/blob/master/src/contain/quadratic.ts
export function containQuadStroke(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  lineWidth: number,
  x: number,
  y: number
): boolean {
  if (lineWidth === 0) {
    return false;
  }
  const _l = lineWidth;
  // Quick reject
  if (
    (y > y0 + _l && y > y1 + _l && y > y2 + _l) ||
    (y < y0 - _l && y < y1 - _l && y < y2 - _l) ||
    (x > x0 + _l && x > x1 + _l && x > x2 + _l) ||
    (x < x0 - _l && x < x1 - _l && x < x2 - _l)
  ) {
    return false;
  }
  const d = quadraticProjectPoint(x0, y0, x1, y1, x2, y2, x, y, null);
  return d <= _l / 2;
}

// 基于zrender
// https://github.com/ecomfe/zrender/blob/master/src/contain/cubic.ts
/**
 * 三次贝塞尔曲线描边包含判断
 */
export function containCubicStroke(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  lineWidth: number,
  x: number,
  y: number
): boolean {
  if (lineWidth === 0) {
    return false;
  }
  const _l = lineWidth;
  // Quick reject
  if (
    (y > y0 + _l && y > y1 + _l && y > y2 + _l && y > y3 + _l) ||
    (y < y0 - _l && y < y1 - _l && y < y2 - _l && y < y3 - _l) ||
    (x > x0 + _l && x > x1 + _l && x > x2 + _l && x > x3 + _l) ||
    (x < x0 - _l && x < x1 - _l && x < x2 - _l && x < x3 - _l)
  ) {
    return false;
  }
  const d = cubicProjectPoint(x0, y0, x1, y1, x2, y2, x3, y3, x, y, null);
  return d <= _l / 2;
}

// 基于zrender
// https://github.com/ecomfe/zrender/blob/master/src/contain/arc.ts
/**
 * 圆弧描边包含判断
 */
export function containArcStroke(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
  anticlockwise: boolean,
  lineWidth: number,
  x: number,
  y: number
): boolean {
  if (lineWidth === 0) {
    return false;
  }
  const _l = lineWidth;

  x -= cx;
  y -= cy;
  const d = Math.sqrt(x * x + y * y);

  if (d - _l > r || d + _l < r) {
    return false;
  }
  // TODO
  if (Math.abs(startAngle - endAngle) % pi2 < 1e-4) {
    // Is a circle
    return true;
  }
  if (anticlockwise) {
    const tmp = startAngle;
    startAngle = normalizeRadian(endAngle);
    endAngle = normalizeRadian(tmp);
  } else {
    startAngle = normalizeRadian(startAngle);
    endAngle = normalizeRadian(endAngle);
  }
  if (startAngle > endAngle) {
    endAngle += pi2;
  }

  let angle = Math.atan2(y, x);
  if (angle < 0) {
    angle += pi2;
  }
  return (angle >= startAngle && angle <= endAngle) || (angle + pi2 >= startAngle && angle + pi2 <= endAngle);
}

// 基于zrender
// https://github.com/ecomfe/zrender/blob/master/src/contain/line.ts
/**
 * 线段包含判断
 * @param  {number}  x0
 * @param  {number}  y0
 * @param  {number}  x1
 * @param  {number}  y1
 * @param  {number}  lineWidth
 * @param  {number}  x
 * @param  {number}  y
 * @return {boolean}
 */
export function containLineStroke(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  lineWidth: number,
  x: number,
  y: number
): boolean {
  if (lineWidth === 0) {
    return false;
  }
  const _l = lineWidth;
  const _halfL = lineWidth / 2;
  let _a = 0;
  let _b = x0;
  // Quick reject
  if (
    (y > y0 + _halfL && y > y1 + _halfL) ||
    (y < y0 - _halfL && y < y1 - _halfL) ||
    (x > x0 + _halfL && x > x1 + _halfL) ||
    (x < x0 - _halfL && x < x1 - _halfL)
  ) {
    return false;
  }

  if (x0 !== x1) {
    _a = (y0 - y1) / (x0 - x1);
    _b = (x0 * y1 - x1 * y0) / (x0 - x1);
  } else {
    return Math.abs(x - x0) <= _l / 2;
  }
  const tmp = _a * x - y + _b;
  const _s = (tmp * tmp) / (_a * _a + 1);
  return _s <= ((_l / 2) * _l) / 2;
}

const globalPoint: IPointLike = { x: 0, y: 0 };
export function transformPoint(pos: IPointLike, ctx: IContext2d, out?: IPointLike): IPointLike {
  const matrix = ctx.currentMatrix.getInverse();
  out = out || globalPoint;
  out.x = pos.x * matrix.a + pos.y * matrix.c + matrix.e;
  out.y = pos.x * matrix.b + pos.y * matrix.d + matrix.f;
  return out;
}

const EPSILON = 1e-4;

/**
 * 计算三次贝塞尔方程根，使用盛金公式
 */
export function cubicRootAt(p0: number, p1: number, p2: number, p3: number, val: number, roots: number[]): number {
  // Evaluate roots of cubic functions
  const a = p3 + 3 * (p1 - p2) - p0;
  const b = 3 * (p2 - p1 * 2 + p0);
  const c = 3 * (p1 - p0);
  const d = p0 - val;

  const A = b * b - 3 * a * c;
  const B = b * c - 9 * a * d;
  const C = c * c - 3 * b * d;

  let n = 0;

  if (isAroundZero(A) && isAroundZero(B)) {
    if (isAroundZero(b)) {
      roots[0] = 0;
    } else {
      const t1 = -c / b; //t1, t2, t3, b is not zero
      if (t1 >= 0 && t1 <= 1) {
        roots[n++] = t1;
      }
    }
  } else {
    const disc = B * B - 4 * A * C;

    if (isAroundZero(disc)) {
      const K = B / A;
      const t1 = -b / a + K; // t1, a is not zero
      const t2 = -K / 2; // t2, t3
      if (t1 >= 0 && t1 <= 1) {
        roots[n++] = t1;
      }
      if (t2 >= 0 && t2 <= 1) {
        roots[n++] = t2;
      }
    } else if (disc > 0) {
      const discSqrt = Math.sqrt(disc);
      let Y1 = A * b + 1.5 * a * (-B + discSqrt);
      let Y2 = A * b + 1.5 * a * (-B - discSqrt);
      if (Y1 < 0) {
        Y1 = -Math.pow(-Y1, ONE_THIRD);
      } else {
        Y1 = Math.pow(Y1, ONE_THIRD);
      }
      if (Y2 < 0) {
        Y2 = -Math.pow(-Y2, ONE_THIRD);
      } else {
        Y2 = Math.pow(Y2, ONE_THIRD);
      }
      const t1 = (-b - (Y1 + Y2)) / (3 * a);
      if (t1 >= 0 && t1 <= 1) {
        roots[n++] = t1;
      }
    } else {
      const T = (2 * A * b - 3 * a * B) / (2 * Math.sqrt(A * A * A));
      const theta = Math.acos(T) / 3;
      const ASqrt = Math.sqrt(A);
      const tmp = Math.cos(theta);

      const t1 = (-b - 2 * ASqrt * tmp) / (3 * a);
      const t2 = (-b + ASqrt * (tmp + THREE_SQRT * Math.sin(theta))) / (3 * a);
      const t3 = (-b + ASqrt * (tmp - THREE_SQRT * Math.sin(theta))) / (3 * a);
      if (t1 >= 0 && t1 <= 1) {
        roots[n++] = t1;
      }
      if (t2 >= 0 && t2 <= 1) {
        roots[n++] = t2;
      }
      if (t3 >= 0 && t3 <= 1) {
        roots[n++] = t3;
      }
    }
  }
  return n;
}

/**
 * 计算三次贝塞尔方程极限值的位置
 * @return 有效数目
 */
export function cubicExtrema(p0: number, p1: number, p2: number, p3: number, extrema: number[]): number {
  const b = 6 * p2 - 12 * p1 + 6 * p0;
  const a = 9 * p1 + 3 * p3 - 3 * p0 - 9 * p2;
  const c = 3 * p1 - 3 * p0;

  let n = 0;
  if (isAroundZero(a)) {
    if (isNotAroundZero(b)) {
      const t1 = -c / b;
      if (t1 >= 0 && t1 <= 1) {
        extrema[n++] = t1;
      }
    }
  } else {
    const disc = b * b - 4 * a * c;
    if (isAroundZero(disc)) {
      extrema[0] = -b / (2 * a);
    } else if (disc > 0) {
      const discSqrt = Math.sqrt(disc);
      const t1 = (-b + discSqrt) / (2 * a);
      const t2 = (-b - discSqrt) / (2 * a);
      if (t1 >= 0 && t1 <= 1) {
        extrema[n++] = t1;
      }
      if (t2 >= 0 && t2 <= 1) {
        extrema[n++] = t2;
      }
    }
  }
  return n;
}

// 基于zrender
// https://github.com/ecomfe/zrender/blob/master/src/contain/path.ts
function isAroundEqual(a: number, b: number) {
  return Math.abs(a - b) < EPSILON;
}

// 临时数组
const roots = [-1, -1, -1];
const extrema = [-1, -1];
// 基于zrender
// https://github.com/ecomfe/zrender/blob/master/src/contain/path.ts
function swapExtrema() {
  const tmp = extrema[0];
  extrema[0] = extrema[1];
  extrema[1] = tmp;
}

// 基于zrender
// https://github.com/ecomfe/zrender/blob/master/src/contain/path.ts
function windingCubic(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  x: number,
  y: number
): number {
  // Quick reject
  if ((y > y0 && y > y1 && y > y2 && y > y3) || (y < y0 && y < y1 && y < y2 && y < y3)) {
    return 0;
  }
  const nRoots = cubicRootAt(y0, y1, y2, y3, y, roots);
  if (nRoots === 0) {
    return 0;
  }

  let w = 0;
  let nExtrema = -1;
  let y0_ = 0;
  let y1_ = 0;
  for (let i = 0; i < nRoots; i++) {
    const t = roots[i];

    // Avoid winding error when intersection point is the connect point of two line of polygon
    const unit = t === 0 || t === 1 ? 0.5 : 1;

    const x_ = cubicAt(x0, x1, x2, x3, t);
    if (x_ < x) {
      // Quick reject
      continue;
    }
    if (nExtrema < 0) {
      nExtrema = cubicExtrema(y0, y1, y2, y3, extrema);
      if (extrema[1] < extrema[0] && nExtrema > 1) {
        swapExtrema();
      }
      y0_ = cubicAt(y0, y1, y2, y3, extrema[0]);
      if (nExtrema > 1) {
        y1_ = cubicAt(y0, y1, y2, y3, extrema[1]);
      }
    }
    if (nExtrema === 2) {
      // 分成三段单调函数
      if (t < extrema[0]) {
        w += y0_ < y0 ? unit : -unit;
      } else if (t < extrema[1]) {
        w += y1_ < y0_ ? unit : -unit;
      } else {
        w += y3 < y1_ ? unit : -unit;
      }
    } else {
      // 分成两段单调函数
      if (t < extrema[0]) {
        w += y0_ < y0 ? unit : -unit;
      } else {
        w += y3 < y0_ ? unit : -unit;
      }
    }
  }
  return w;
}

// 基于zrender
// https://github.com/ecomfe/zrender/blob/master/src/contain/path.ts
function windingQuadratic(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x: number,
  y: number
): number {
  // Quick reject
  if ((y > y0 && y > y1 && y > y2) || (y < y0 && y < y1 && y < y2)) {
    return 0;
  }
  const nRoots = quadraticRootAt(y0, y1, y2, y, roots);
  if (nRoots === 0) {
    return 0;
  }

  const t = quadraticExtremum(y0, y1, y2);
  if (t >= 0 && t <= 1) {
    let w = 0;
    const y_ = quadraticAt(y0, y1, y2, t);
    for (let i = 0; i < nRoots; i++) {
      // Remove one endpoint.
      const unit = roots[i] === 0 || roots[i] === 1 ? 0.5 : 1;

      const x_ = quadraticAt(x0, x1, x2, roots[i]);
      if (x_ < x) {
        // Quick reject
        continue;
      }
      if (roots[i] < t) {
        w += y_ < y0 ? unit : -unit;
      } else {
        w += y2 < y_ ? unit : -unit;
      }
    }
    return w;
  }

  // Remove one endpoint.
  const unit = roots[0] === 0 || roots[0] === 1 ? 0.5 : 1;

  const x_ = quadraticAt(x0, x1, x2, roots[0]);
  if (x_ < x) {
    // Quick reject
    return 0;
  }
  return y2 < y0 ? unit : -unit;
}

// 基于zrender
// https://github.com/ecomfe/zrender/blob/master/src/contain/path.ts
// TODO
// Arc 旋转
// startAngle, endAngle has been normalized by normalizeArcAngles
function windingArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
  anticlockwise: boolean,
  x: number,
  y: number
) {
  y -= cy;
  if (y > r || y < -r) {
    return 0;
  }
  const tmp = Math.sqrt(r * r - y * y);
  roots[0] = -tmp;
  roots[1] = tmp;

  const dTheta = Math.abs(startAngle - endAngle);
  if (dTheta < 1e-4) {
    return 0;
  }
  if (dTheta >= pi2 - 1e-4) {
    // Is a circle
    startAngle = 0;
    endAngle = pi2;
    const dir = anticlockwise ? 1 : -1;
    if (x >= roots[0] + cx && x <= roots[1] + cx) {
      return dir;
    }

    return 0;
  }

  if (startAngle > endAngle) {
    // Swap, make sure startAngle is smaller than endAngle.
    const tmp = startAngle;
    startAngle = endAngle;
    endAngle = tmp;
  }
  // endAngle - startAngle is normalized to 0 - 2*pi.
  // So following will normalize them to 0 - 4*pi
  if (startAngle < 0) {
    startAngle += pi2;
    endAngle += pi2;
  }

  let w = 0;
  for (let i = 0; i < 2; i++) {
    const x_ = roots[i];
    if (x_ + cx > x) {
      let angle = Math.atan2(y, x_);
      let dir = anticlockwise ? 1 : -1;
      if (angle < 0) {
        angle = pi2 + angle;
      }
      if ((angle >= startAngle && angle <= endAngle) || (angle + pi2 >= startAngle && angle + pi2 <= endAngle)) {
        if (angle > pi / 2 && angle < pi * 1.5) {
          dir = -dir;
        }
        w += dir;
      }
    }
  }
  return w;
}
// 基于zrender
// https://github.com/ecomfe/zrender/blob/master/src/core/PathProxy.ts
function modpi2(radian: number) {
  const n = Math.round((radian / pi) * 1e8) / 1e8;
  return (n % 2) * pi;
}
// 基于zrender
// https://github.com/ecomfe/zrender/blob/master/src/core/PathProxy.ts
function normalizeArcAngles(angles: [number, number], anticlockwise: boolean) {
  let newStartAngle = modpi2(angles[0]);
  if (newStartAngle < 0) {
    newStartAngle += pi2;
  }
  const delta = newStartAngle - angles[0];
  let newEndAngle = angles[1];
  newEndAngle += delta;
  if (!anticlockwise && newEndAngle - newStartAngle >= pi2) {
    newEndAngle = newStartAngle + pi2;
  } else if (anticlockwise && newStartAngle - newEndAngle >= pi2) {
    newEndAngle = newStartAngle - pi2;
  } else if (!anticlockwise && newStartAngle > newEndAngle) {
    newEndAngle = newStartAngle + (pi2 - modpi2(newStartAngle - newEndAngle));
  } else if (anticlockwise && newStartAngle < newEndAngle) {
    newEndAngle = newStartAngle - (pi2 - modpi2(newEndAngle - newStartAngle));
  }
  angles[0] = newStartAngle;
  angles[1] = newEndAngle;
}

const tmpAngles: [number, number] = [0, 0];
// 基于zrender
// https://github.com/ecomfe/zrender/blob/master/src/contain/path.ts
function containPath(commands: CommandType[], lineWidth: number, isStroke: boolean, x: number, y: number): boolean {
  const data = commands;
  const len = commands.length;
  let w = 0;
  let xi = 0;
  let yi = 0;
  let x0 = 0;
  let y0 = 0;
  let x1;
  let y1;

  for (let i = 0; i < len; i++) {
    const command = data[i];
    const isFirst = i === 0;
    // Begin a new subpath
    if (command[0] === CMD.M && i > 1) {
      // Close previous subpath
      if (!isStroke) {
        w += isPointInLine(xi, yi, x0, y0, x, y);
      }
    }
    if (isFirst) {
      // 如果第一个命令是 L, C, Q
      // 则 previous point 同绘制命令的第一个 point
      //
      // 第一个命令为 Arc 的情况下会在后面特殊处理
      xi = command[1] as number;
      yi = command[2] as number;

      x0 = xi;
      y0 = yi;
    }

    const c0 = command[0];
    const c1 = command[1] as number;
    const c2 = command[2] as number;
    const c3 = command[3] as number;
    const c4 = command[4] as number;
    const c5 = command[5] as number;
    const c6 = command[6] as number;

    // TODO Arc 判断的开销比较大
    let startAngle = c4;
    let endAngle = c5;
    tmpAngles[0] = startAngle;
    tmpAngles[1] = endAngle;
    normalizeArcAngles(tmpAngles, Boolean(command[6]));
    startAngle = tmpAngles[0];
    endAngle = tmpAngles[1];
    const theta = startAngle;
    const dTheta = endAngle - startAngle;
    const anticlockwise = !!(1 - (command[6] ? 0 : 1));
    const _x = ((x - c1) * c3) / c3 + c1;
    switch (c0) {
      case CMD.M:
        // moveTo 命令重新创建一个新的 subpath, 并且更新新的起点
        // 在 closePath 的时候使用
        x0 = c1;
        y0 = c2;
        xi = x0;
        yi = y0;
        break;
      case CMD.L:
        if (isStroke) {
          if (containLineStroke(xi, yi, c1, c2, lineWidth, x, y)) {
            return true;
          }
        } else {
          // NOTE 在第一个命令为 L, C, Q 的时候会计算出 NaN
          w += isPointInLine(xi, yi, c1, c2, x, y) || 0;
        }
        xi = c1;
        yi = c2;
        break;
      case CMD.C:
        if (isStroke) {
          if (containCubicStroke(xi, yi, c1, c2, c3, c4, c5, c6, lineWidth, x, y)) {
            return true;
          }
        } else {
          w += windingCubic(xi, yi, c1, c2, c3, c4, c5, c6, x, y) || 0;
        }
        xi = c5;
        yi = c6;
        break;
      case CMD.Q:
        if (isStroke) {
          if (containQuadStroke(xi, yi, c1, c2, c3, c4, lineWidth, x, y)) {
            return true;
          }
        } else {
          w += windingQuadratic(xi, yi, c1, c2, c3, c4, x, y) || 0;
        }
        xi = c3;
        yi = c4;
        break;
      case CMD.A:
        // TODO Arc 旋转
        x1 = Math.cos(theta) * c3 + c1;
        y1 = Math.sin(theta) * c3 + c2;
        // 不是直接使用 arc 命令
        if (!isFirst) {
          w += isPointInLine(xi, yi, x1, y1, x, y);
        } else {
          // 第一个命令起点还未定义
          x0 = x1;
          y0 = y1;
        }
        // zr 使用scale来模拟椭圆, 这里也对x做一定的缩放
        if (isStroke) {
          if (containArcStroke(c1, c2, c3, theta, theta + dTheta, anticlockwise, lineWidth, _x, y)) {
            return true;
          }
        } else {
          w += windingArc(c1, c2, c3, theta, theta + dTheta, anticlockwise, _x, y);
        }
        xi = Math.cos(theta + dTheta) * c3 + c1;
        yi = Math.sin(theta + dTheta) * c3 + c2;
        break;
      case CMD.R:
        x0 = xi = c1;
        y0 = yi = c2;
        x1 = x0 + c3;
        y1 = y0 + c4;
        if (isStroke) {
          if (
            containLineStroke(x0, y0, x1, y0, lineWidth, x, y) ||
            containLineStroke(x1, y0, x1, y1, lineWidth, x, y) ||
            containLineStroke(x1, y1, x0, y1, lineWidth, x, y) ||
            containLineStroke(x0, y1, x0, y0, lineWidth, x, y)
          ) {
            return true;
          }
        } else {
          // FIXME Clockwise ?
          w += isPointInLine(x1, y0, x1, y1, x, y);
          w += isPointInLine(x0, y1, x0, y0, x, y);
        }
        break;
      case CMD.Z:
        if (isStroke) {
          if (containLineStroke(xi, yi, x0, y0, lineWidth, x, y)) {
            return true;
          }
        } else {
          // Close a subpath
          w += isPointInLine(xi, yi, x0, y0, x, y);
          // 如果被任何一个 subpath 包含
          // FIXME subpaths may overlap
          // if (w !== 0) {
          //     return true;
          // }
        }
        xi = x0;
        yi = y0;
        break;
    }
  }
  if (!isStroke && !isAroundEqual(yi, y0)) {
    w += isPointInLine(xi, yi, x0, y0, x, y) || 0;
  }
  return w !== 0;
}

// 基于zrender
// https://github.com/ecomfe/zrender/blob/master/src/contain/path.ts
export function contain(commands: CommandType[], x: number, y: number): boolean {
  return containPath(commands, 0, false, x, y);
}
// 基于zrender
// https://github.com/ecomfe/zrender/blob/master/src/contain/path.ts
export function containStroke(commands: CommandType[], lineWidth: number, x: number, y: number): boolean {
  return containPath(commands, lineWidth, true, x, y);
}
