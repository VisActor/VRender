import { degreeToRadian, halfPi, tau } from '@visactor/vutils';
import type { ICustomPath2D } from '../../interface';

// const segmentCache: Record<string, number[][]> = {};
// const bezierCache: Record<string, [number, number, number, number, number, number]> = {};

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
// const join = [].join;

// Copied from Inkscape svgtopdf, thanks!
export function segments(
  x: number,
  y: number,
  rx: number,
  ry: number,
  large: number,
  sweep: number,
  rotateX: number,
  ox: number,
  oy: number
) {
  // const key = join.call([x, y, rx, ry, large, sweep, rotateX, ox, oy]);
  // if (segmentCache[key]) {
  //   return segmentCache[key];
  // }

  const th = degreeToRadian(rotateX);
  const sin_th = Math.sin(th);
  const cos_th = Math.cos(th);
  rx = Math.abs(rx);
  ry = Math.abs(ry);
  const px = cos_th * (ox - x) * 0.5 + sin_th * (oy - y) * 0.5;
  const py = cos_th * (oy - y) * 0.5 - sin_th * (ox - x) * 0.5;
  let pl = (px * px) / (rx * rx) + (py * py) / (ry * ry);
  if (pl > 1) {
    pl = Math.sqrt(pl);
    rx *= pl;
    ry *= pl;
  }

  const a00 = cos_th / rx;
  const a01 = sin_th / rx;
  const a10 = -sin_th / ry;
  const a11 = cos_th / ry;
  const x0 = a00 * ox + a01 * oy;
  const y0 = a10 * ox + a11 * oy;
  const x1 = a00 * x + a01 * y;
  const y1 = a10 * x + a11 * y;

  const d = (x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0);
  let sfactor_sq = 1 / d - 0.25;
  if (sfactor_sq < 0) {
    sfactor_sq = 0;
  }
  let sfactor = Math.sqrt(sfactor_sq);
  if (sweep === large) {
    sfactor = -sfactor;
  }
  const xc = 0.5 * (x0 + x1) - sfactor * (y1 - y0);
  const yc = 0.5 * (y0 + y1) + sfactor * (x1 - x0);

  const th0 = Math.atan2(y0 - yc, x0 - xc);
  const th1 = Math.atan2(y1 - yc, x1 - xc);

  let th_arc = th1 - th0;
  if (th_arc < 0 && sweep === 1) {
    th_arc += tau;
  } else if (th_arc > 0 && sweep === 0) {
    th_arc -= tau;
  }

  const segs = Math.ceil(Math.abs(th_arc / (halfPi + 0.001)));
  const result = [];
  for (let i = 0; i < segs; ++i) {
    const th2 = th0 + (i * th_arc) / segs;
    const th3 = th0 + ((i + 1) * th_arc) / segs;
    result[i] = [xc, yc, th2, th3, rx, ry, sin_th, cos_th];
  }

  return result;
}

export function bezier(params: number[]) {
  // const key = join.call(params);
  // if (bezierCache[key]) {
  //   return bezierCache[key];
  // }

  const cx = params[0];
  const cy = params[1];
  const th0 = params[2];
  const th1 = params[3];
  const rx = params[4];
  const ry = params[5];
  const sin_th = params[6];
  const cos_th = params[7];

  const a00 = cos_th * rx;
  const a01 = -sin_th * ry;
  const a10 = sin_th * rx;
  const a11 = cos_th * ry;

  const cos_th0 = Math.cos(th0);
  const sin_th0 = Math.sin(th0);
  const cos_th1 = Math.cos(th1);
  const sin_th1 = Math.sin(th1);

  const th_half = 0.5 * (th1 - th0);
  const sin_th_h2 = Math.sin(th_half * 0.5);
  const t = ((8 / 3) * sin_th_h2 * sin_th_h2) / Math.sin(th_half);
  const x1 = cx + cos_th0 - t * sin_th0;
  const y1 = cy + sin_th0 + t * cos_th0;
  const x3 = cx + cos_th1;
  const y3 = cy + sin_th1;
  const x2 = x3 + t * sin_th1;
  const y2 = y3 - t * cos_th1;

  return [
    a00 * x1 + a01 * y1,
    a10 * x1 + a11 * y1,
    a00 * x2 + a01 * y2,
    a10 * x2 + a11 * y2,
    a00 * x3 + a01 * y3,
    a10 * x3 + a11 * y3
  ];
}

export function drawArc(
  context: ICustomPath2D,
  x: number,
  y: number,
  coords: [number, number, number, number, number, number, number]
) {
  const seg = segments(
    coords[5], // end x
    coords[6], // end y
    coords[0], // radius x
    coords[1], // radius y
    coords[3], // large flag
    coords[4], // sweep flag
    coords[2], // rotation
    x,
    y
  );
  for (let i = 0; i < seg.length; ++i) {
    const bez = bezier(seg[i]);
    context.bezierCurveTo(bez[0], bez[1], bez[2], bez[3], bez[4], bez[5]);
  }
}

/* Adapted from zrender by ecomfe
 * https://github.com/ecomfe/zrender
 * Licensed under the BSD-3-Clause

 * url: https://github.com/ecomfe/zrender/blob/master/src/tool/morphPath.ts
 * License: https://github.com/ecomfe/zrender/blob/master/LICENSE
 * @license
 */

/**
 * 将弧形添加到贝塞尔路径
 * @param bezierPath 贝塞尔路径数组
 * @param startAngle 起始角度
 * @param endAngle 结束角度
 * @param cx 圆心x坐标
 * @param cy 圆心y坐标
 * @param rx x半径
 * @param ry y半径
 * @param counterclockwise 是否逆时针，默认为false(顺时针)
 */
export const addArcToBezierPath = (
  bezierPath: number[],
  startAngle: number,
  endAngle: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  counterclockwise: boolean = false
) => {
  // https://stackoverflow.com/questions/1734745/how-to-create-circle-with-b%C3%A9zier-curves

  // 标准化角度到 [0, 2π] 范围
  const PI2 = Math.PI * 2;
  const sAngle = ((startAngle % PI2) + PI2) % PI2;
  let eAngle = ((endAngle % PI2) + PI2) % PI2;

  // 确定角度差并进行角度调整
  let deltaAngle;
  if (counterclockwise) {
    // 逆时针时，确保终点角度小于起点角度
    if (eAngle >= sAngle) {
      eAngle -= PI2;
    }
    deltaAngle = eAngle - sAngle;
  } else {
    // 顺时针时，确保终点角度大于起点角度
    if (eAngle <= sAngle) {
      eAngle += PI2;
    }
    deltaAngle = eAngle - sAngle;
  }

  // 计算需要分成的段数，每段不超过90度
  const count = Math.ceil(Math.abs(deltaAngle) / (Math.PI * 0.5));
  // 每段的角度增量
  const stepAngle = deltaAngle / count;

  // 对每段生成贝塞尔曲线
  for (let i = 0; i < count; i++) {
    const sa = sAngle + stepAngle * i;
    const ea = sAngle + stepAngle * (i + 1);

    // 计算贝塞尔控制点的参数
    // 4/3 * tan(θ/4) 是贝塞尔曲线近似圆弧的最佳比例
    const len = (4 / 3) * Math.tan(Math.abs(stepAngle) / 4);

    // 计算起点和终点坐标
    const c1 = Math.cos(sa);
    const s1 = Math.sin(sa);
    const c2 = Math.cos(ea);
    const s2 = Math.sin(ea);

    const x1 = c1 * rx + cx;
    const y1 = s1 * ry + cy;

    const x4 = c2 * rx + cx;
    const y4 = s2 * ry + cy;

    // 计算控制点坐标，符号根据方向调整
    const sign = counterclockwise ? -1 : 1;
    const hx = rx * len * sign;
    const hy = ry * len * sign;

    // 将贝塞尔曲线点添加到路径
    bezierPath.push(
      x1 - hx * s1, // 第一个控制点x
      y1 + hy * c1, // 第一个控制点y
      x4 + hx * s2, // 第二个控制点x
      y4 - hy * c2, // 第二个控制点y
      x4, // 终点x
      y4 // 终点y
    );
  }
};
