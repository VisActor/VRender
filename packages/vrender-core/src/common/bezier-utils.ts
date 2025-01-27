import type { IPointLike, IPoint } from '@visactor/vutils';
import { PointService, Point } from '@visactor/vutils';
export function snapLength(xArr: number[], yArr: number[]) {
  let totalLength = 0;
  const count = xArr.length;
  for (let i = 0; i < count; i++) {
    const x = xArr[i];
    const y = yArr[i];
    const nextX = xArr[(i + 1) % count];
    const nextY = yArr[(i + 1) % count];
    totalLength += PointService.distanceNN(x, y, nextX, nextY);
  }
  return totalLength / 2;
}

/**
 * 计算贝塞尔曲线的长度
 * @param p0 起点
 * @param p1 控制点1
 * @param p2 控制点2
 * @param p3 终点
 * @param iterationCount
 */
export function cubicLength(p0: IPointLike, p1: IPointLike, p2: IPointLike, p3: IPointLike, iterationCount: number) {
  return snapLength([p0.x, p1.x, p2.x, p3.x], [p0.y, p1.y, p2.y, p3.y]);
}

export function cubicCalc(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const one = 1 - t;
  return one * one * one * p0 + 3 * p1 * t * one * one + 3 * p2 * t * t * one + p3 * t * t * t;
}

/**
 * 根据t计算三次贝塞尔的点
 * example：
 *   x: cubicAt(x1, x2, x3, x4, t),
 *   y: cubicAt(y1, y2, y3, y4, t),
 * @param p0 起点坐标
 * @param p1 控制点1
 * @param p2 控制点2
 * @param p3 终点坐标
 * @param t
 */
export function cubicPointAt(p0: IPointLike, p1: IPointLike, p2: IPointLike, p3: IPointLike, t: number): IPoint {
  const x = cubicCalc(p0.x, p1.x, p2.x, p3.x, t);
  const y = cubicCalc(p0.y, p1.y, p2.y, p3.y, t);
  return new Point(x, y);
}

export function quadCalc(p0: number, p1: number, p2: number, t: number): number {
  const one = 1 - t;
  return one * one * p0 + 2 * one * t * p1 + t * t * p2;
}

/**
 * 根据t计算三次贝塞尔的点
 * example：
 *   x: cubicAt(x1, x2, x3, x4, t),
 *   y: cubicAt(y1, y2, y3, y4, t),
 * @param p0 起点坐标
 * @param p1 控制点1
 * @param p2 控制点2
 * @param p3 终点坐标
 * @param t
 */
export function quadPointAt(p0: IPointLike, p1: IPointLike, p2: IPointLike, t: number): IPoint {
  const x = quadCalc(p0.x, p1.x, p2.x, t);
  const y = quadCalc(p0.y, p1.y, p2.y, t);
  return new Point(x, y);
}

/**
 * 计算贝塞尔曲线的长度
 * @param p0 起点
 * @param p1 控制点1
 * @param p2 控制点2
 * @param p3 终点
 * @param iterationCount
 */
export function quadLength(p0: IPointLike, p1: IPointLike, p2: IPointLike, iterationCount: number) {
  return snapLength([p0.x, p1.x, p2.x], [p0.y, p1.y, p2.y]);
}
