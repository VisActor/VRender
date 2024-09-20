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

export const addArcToBezierPath = (
  bezierPath: number[],
  startAngle: number,
  endAngle: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number
) => {
  // https://stackoverflow.com/questions/1734745/how-to-create-circle-with-b%C3%A9zier-curves
  const delta = Math.abs(endAngle - startAngle);
  const count = delta > 0.5 * Math.PI ? Math.ceil((2 * delta) / Math.PI) : 1;
  const stepAngle = (endAngle - startAngle) / count;

  for (let i = 0; i < count; i++) {
    const sa = startAngle + stepAngle * i;
    const ea = startAngle + stepAngle * (i + 1);
    const len = (Math.tan(Math.abs(stepAngle) / 4) * 4) / 3;
    const dir = ea < sa ? -1 : 1;

    const c1 = Math.cos(sa);
    const s1 = Math.sin(sa);
    const c2 = Math.cos(ea);
    const s2 = Math.sin(ea);

    const x1 = c1 * rx + cx;
    const y1 = s1 * ry + cy;

    const x4 = c2 * rx + cx;
    const y4 = s2 * ry + cy;

    const hx = rx * len * dir;
    const hy = ry * len * dir;

    bezierPath.push(
      // Move control points on tangent.
      x1 - hx * s1,
      y1 + hy * c1,
      x4 + hx * s2,
      y4 - hy * c2,
      x4,
      y4
    );
  }
};
