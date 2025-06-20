import type { IDirection, IPath2D, IQuadraticBezierCurve } from '../../../interface';
import { quadLength, quadPointAt } from '../../bezier-utils';
import { CurveTypeEnum, Direction } from '../../enums';
import { Curve } from './base';
import { abs, atan2, max, min, PointService, type IPoint, type IPointLike } from '@visactor/vutils';

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

export class QuadraticBezierCurve extends Curve implements IQuadraticBezierCurve {
  type: number = CurveTypeEnum.QuadraticBezierCurve;
  declare originP1?: IPointLike;
  declare originP2?: IPointLike;

  declare readonly p0: IPoint;
  declare readonly p1: IPoint;
  declare readonly p2: IPoint;
  constructor(p0: IPoint, p1: IPoint, p2: IPoint) {
    super();
    this.p0 = p0;
    this.p1 = p1;
    this.p2 = p2;
  }

  protected _validPoint(): boolean {
    return Number.isFinite(this.p0.x + this.p0.y + this.p1.x + this.p1.y + this.p2.x + this.p2.y);
  }

  getPointAt(t: number): IPointLike {
    if (this.defined !== false) {
      return quadPointAt(this.p0, this.p1, this.p2, t);
    }
    throw new Error('defined为false的点不能getPointAt');
  }
  protected calcLength(): number {
    if (this._validPoint()) {
      return quadLength(this.p0, this.p1, this.p2, 0);
    }
    // 默认长度不好给
    return 60;
  }
  protected calcProjLength(direction: IDirection): number {
    if (direction === Direction.ROW) {
      return abs(this.p0.x - this.p2.x);
    } else if (direction === Direction.COLUMN) {
      return abs(this.p0.y - this.p2.y);
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
      path.quadraticCurveTo(this.p1.x * sx + x, this.p1.y * sy + y, this.p2.x * sx + x, this.p2.y * sy + y);
    } else if (percent > 0) {
      const [curve1] = divideQuad(this, percent);
      path.quadraticCurveTo(curve1.p1.x * sx + x, curve1.p1.y * sy + y, curve1.p2.x * sx + x, curve1.p2.y * sy + y);
    }
  }

  getYAt(x: number): number {
    throw new Error('QuadraticBezierCurve暂不支持getYAt');
  }
  includeX(x: number): boolean {
    throw new Error('QuadraticBezierCurve暂不支持includeX');
  }
}
