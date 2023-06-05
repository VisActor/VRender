import { IPointLike, IPoint, PointService, Point } from '@visactor/vutils';
import { CubicBezierCurve, LineCurve } from './path';

// TODO 替换这里的逻辑

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

/**
 * 对三次贝塞尔曲线进行分割
 * @param p0 起点
 * @param p1 控制点1
 * @param p2 控制点2
 * @param p3 终点
 * @param t
 */
export function divideCubic(curve: CubicBezierCurve, t: number): CubicBezierCurve[] {
  const { p0, p1, p2, p3 } = curve;

  // 划分点
  const pt = cubicPointAt(p0, p1, p2, p3, t);
  //  const xt = pt.x;
  //  const yt = pt.y;

  // 计算两点之间的差值点
  const c1 = PointService.pointAtPP(p0, p1, t);
  const c2 = PointService.pointAtPP(p1, p2, t);
  const c3 = PointService.pointAtPP(p2, p3, t);
  const c12 = PointService.pointAtPP(c1, c2, t);
  const c23 = PointService.pointAtPP(c2, c3, t);
  // const direction = p1.x1 ? p1.y > p0.y ? 0 : 1 : p1.x > p0.x ? 0 : 1;

  const curve1 = new CubicBezierCurve(p0, c1, c12, pt);
  const curve2 = new CubicBezierCurve(pt, c23, c3, p3);

  return [curve1, curve2];
}

export function divideLinear(curve: LineCurve, t: number): LineCurve[] {
  const { p0, p1 } = curve;

  // 计算两点之间的差值点
  const c1 = PointService.pointAtPP(p0, p1, t);
  // const direction = p1.x1 ? p1.y > p0.y ? 0 : 1 : p1.x > p0.x ? 0 : 1;

  const curve1 = new LineCurve(p0, c1);
  const curve2 = new LineCurve(c1, p1);

  return [curve1, curve2];
}
