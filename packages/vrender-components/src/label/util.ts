import type { IPolarPoint, IPoint, Quadrant } from './type';
import type { IBoundsLike } from '@visactor/vutils';
import { radianToDegree, isValidNumber } from '@visactor/vutils';

/**
 * 极坐标系 -> 直角坐标系
 * @param point
 * @returns
 */
export function polarToCartesian(point: IPolarPoint): IPoint {
  if (!point.radius) {
    return { x: 0, y: 0 };
  }
  return {
    x: Math.cos(point.angle) * point.radius,
    y: Math.sin(point.angle) * point.radius
  };
}

/**
 * 计算圆弧上的点坐标
 * @param x0 圆心 x 坐标
 * @param y0 圆心 y 坐标
 * @param radius 圆弧半径
 * @param radian 点所在弧度
 */
export function circlePoint(x0: number, y0: number, radius: number, radian: number): IPoint {
  const offset = polarToCartesian({
    radius,
    angle: radian
  });
  return {
    x: x0 + offset.x,
    y: y0 + offset.y
  };
}

export function isQuadrantLeft(quadrant: Quadrant): boolean {
  return quadrant === 3 || quadrant === 4;
}

export function isQuadrantRight(quadrant: Quadrant): boolean {
  return quadrant === 1 || quadrant === 2;
}

/**
 * 计算直线与圆交点
 * 直线方程：ax + by + c = 0
 * 圆方程：(x - x0)^2 + (y - y0)^2 = r^2
 */
export function lineCirclePoints(a: number, b: number, c: number, x0: number, y0: number, r: number): IPoint[] {
  if ((a === 0 && b === 0) || r <= 0) {
    return [];
  }
  if (a === 0) {
    const y1 = -c / b;
    const fy = (y1 - y0) ** 2;
    const fd = r ** 2 - fy;
    if (fd < 0) {
      return [];
    } else if (fd === 0) {
      return [{ x: x0, y: y1 }];
    }
    const x1 = Math.sqrt(fd) + x0;
    const x2 = -Math.sqrt(fd) + x0;
    return [
      { x: x1, y: y1 },
      { x: x2, y: y1 }
    ];
  } else if (b === 0) {
    const x1 = -c / a;
    const fx = (x1 - x0) ** 2;
    const fd = r ** 2 - fx;
    if (fd < 0) {
      return [];
    } else if (fd === 0) {
      return [{ x: x1, y: y0 }];
    }
    const y1 = Math.sqrt(fd) + y0;
    const y2 = -Math.sqrt(fd) + y0;
    return [
      { x: x1, y: y1 },
      { x: x1, y: y2 }
    ];
  }
  const fa = (b / a) ** 2 + 1;
  const fb = 2 * ((c / a + x0) * (b / a) - y0);
  const fc = (c / a + x0) ** 2 + y0 ** 2 - r ** 2;
  const fd = fb ** 2 - 4 * fa * fc;
  if (fd < 0) {
    return [];
  }
  const y1 = (-fb + Math.sqrt(fd)) / (2 * fa);
  const y2 = (-fb - Math.sqrt(fd)) / (2 * fa);
  const x1 = -(b * y1 + c) / a;
  const x2 = -(b * y2 + c) / a;
  if (fd === 0) {
    return [{ x: x1, y: y1 }];
  }
  return [
    { x: x1, y: y1 },
    { x: x2, y: y2 }
  ];
}

/**
 * 根据圆弧两点连接线长度计算弧度
 * @param radius 圆弧半径
 * @param length 连接线长度
 */
export function connectLineRadian(radius: number, length: number) {
  if (length > radius * 2) {
    return NaN;
  }
  return Math.asin(length / 2 / radius) * 2;
}

export function checkBoundsOverlap(boundsA: IBoundsLike, boundsB: IBoundsLike): boolean {
  const { x1: ax1, y1: ay1, x2: ax2, y2: ay2 } = boundsA;
  const { x1: bx1, y1: by1, x2: bx2, y2: by2 } = boundsB;
  return !(
    (ax1 <= bx1 && ax2 <= bx1) ||
    (ax1 >= bx2 && ax2 >= bx2) ||
    (ay1 <= by1 && ay2 <= by1) ||
    (ay1 >= by2 && ay2 >= by2)
  );
}

export const degrees = (angle?: number) => {
  if (!isValidNumber(angle)) {
    return null;
  }
  return radianToDegree(angle);
};
