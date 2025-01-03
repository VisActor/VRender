import type { IPoint, IPointLike } from '@visactor/vutils';
import { abs, atan2, max, min, PointService } from '@visactor/vutils';
import type { ICubicBezierCurve, IDirection, IPath2D, IQuadraticBezierCurve } from '../../../interface';
import { Curve } from './base';
import { CurveTypeEnum, Direction } from '../../enums';
import { cubicLength, cubicPointAt, quadPointAt } from '../../bezier-utils';
import { QuadraticBezierCurve } from './quadratic-bezier';

/**
 * 对三次贝塞尔曲线进行分割
 * @param p0 起点
 * @param p1 控制点1
 * @param p2 控制点2
 * @param p3 终点
 * @param t
 */
export function divideCubic(curve: ICubicBezierCurve, t: number): ICubicBezierCurve[] {
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
/**
 * 对三次贝塞尔曲线进行分割
 * @param p0 起点
 * @param p1 控制点1
 * @param p2 控制点2
 * @param p3 终点
 * @param t
 */
export function divideQuad(curve: IQuadraticBezierCurve, t: number): IQuadraticBezierCurve[] {
  const { p0, p1, p2 } = curve;

  // 划分点
  const pt = quadPointAt(p0, p1, p2, t);
  //  const xt = pt.x;
  //  const yt = pt.y;

  // 计算两点之间的差值点
  const c1 = PointService.pointAtPP(p0, p1, t);
  const c2 = PointService.pointAtPP(p1, p2, t);
  // const c3 = PointService.pointAtPP(p2, p3, t);
  // const c12 = PointService.pointAtPP(c1, c2, t);
  // const c23 = PointService.pointAtPP(c2, c3, t);
  // const direction = p1.x1 ? p1.y > p0.y ? 0 : 1 : p1.x > p0.x ? 0 : 1;

  const curve1 = new QuadraticBezierCurve(p0, c1, pt);
  const curve2 = new QuadraticBezierCurve(pt, c2, p2);

  return [curve1, curve2];
}

export class CubicBezierCurve extends Curve implements ICubicBezierCurve {
  type: number = CurveTypeEnum.CubicBezierCurve;
  declare originP1?: IPointLike;
  declare originP2?: IPointLike;
  declare readonly p0: IPoint;
  declare readonly p1: IPoint;
  declare readonly p2: IPoint;
  declare readonly p3: IPoint;
  constructor(p0: IPoint, p1: IPoint, p2: IPoint, p3: IPoint) {
    super();
    this.p0 = p0;
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;
  }

  protected _validPoint(): boolean {
    return Number.isFinite(
      this.p0.x + this.p0.y + this.p1.x + this.p1.y + this.p2.x + this.p2.y + this.p3.x + this.p3.y
    );
  }
  getPointAt(t: number): IPointLike {
    if (this.defined !== false) {
      return cubicPointAt(this.p0, this.p1, this.p2, this.p3, t);
    }
    throw new Error('defined为false的点不能getPointAt');
  }
  protected calcLength(): number {
    // throw new Error('CubicBezierCurve暂不支持updateLength');
    if (this._validPoint()) {
      return cubicLength(this.p0, this.p1, this.p2, this.p3, 0);
    }
    // return distance(this.p0.x || 0, this.p0.y || 0, this.p3.x || 0, this.p3.y || 0);
    // 默认长度不好给
    return 60;
  }

  protected calcProjLength(direction: IDirection): number {
    if (direction === Direction.ROW) {
      return abs(this.p0.x - this.p3.x);
    } else if (direction === Direction.COLUMN) {
      return abs(this.p0.y - this.p3.y);
    }
    return 0;
  }
  getAngleAt(t: number): number {
    const minT = max(t - 0.01, 0);
    const maxT = min(t + 0.01, 1);
    const minP = this.getPointAt(minT);
    const maxP = this.getPointAt(maxT);
    return atan2(maxP.y - minP.y, maxP.x - minP.x);
  }
  draw(path: IPath2D, x: number, y: number, sx: number, sy: number, percent: number) {
    path.moveTo(this.p0.x * sx + x, this.p0.y * sy + y);
    if (percent >= 1) {
      path.bezierCurveTo(
        this.p1.x * sx + x,
        this.p1.y * sy + y,
        this.p2.x * sx + x,
        this.p2.y * sy + y,
        this.p3.x * sx + x,
        this.p3.y * sy + y
      );
    } else if (percent > 0) {
      const [curve1] = divideCubic(this, percent);
      path.bezierCurveTo(
        curve1.p1.x * sx + x,
        curve1.p1.y * sy + y,
        curve1.p2.x * sx + x,
        curve1.p2.y * sy + y,
        curve1.p3.x * sx + x,
        curve1.p3.y * sy + y
      );
    }
  }

  includeX(x: number): boolean {
    const minX = min(this.p0.x, this.p1.x, this.p2.x, this.p3.x);
    const maxX = max(this.p0.x, this.p1.x, this.p2.x, this.p3.x);
    return x >= minX && x <= maxX;
  }

  getYAt(x: number): number {
    const minX = min(this.p0.x, this.p1.x, this.p2.x, this.p3.x);
    const maxX = max(this.p0.x, this.p1.x, this.p2.x, this.p3.x);
    const t = (x - minX) / (maxX - minX);
    return this.getPointAt(t).y;
  }
}
