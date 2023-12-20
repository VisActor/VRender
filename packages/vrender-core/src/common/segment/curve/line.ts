import type { IPoint, IPointLike } from '@visactor/vutils';
import { abs, atan2, PointService } from '@visactor/vutils';
import type { ILineCurve, IDirection } from '../../../interface';
import { Curve } from './base';
import { CurveTypeEnum, Direction } from '../../enums';

export function divideLinear(curve: ILineCurve, t: number): ILineCurve[] {
  const { p0, p1 } = curve;

  // 计算两点之间的差值点
  const c1 = PointService.pointAtPP(p0, p1, t);
  // const direction = p1.x1 ? p1.y > p0.y ? 0 : 1 : p1.x > p0.x ? 0 : 1;

  const curve1 = new LineCurve(p0, c1);
  const curve2 = new LineCurve(c1, p1);

  return [curve1, curve2];
}

export class LineCurve extends Curve implements ILineCurve {
  type: number = CurveTypeEnum.LineCurve;
  declare originP1?: IPointLike;
  declare originP2?: IPointLike;
  declare p0: IPoint;
  declare p1: IPoint;
  declare angle: number;
  constructor(p0: IPoint, p1: IPoint) {
    super();
    this.p0 = p0;
    this.p1 = p1;
  }
  getPointAt(t: number): IPointLike {
    if (this.defined !== false) {
      return PointService.pointAtPP(this.p0, this.p1, t);
    }
    throw new Error('defined为false的点不能getPointAt');
  }

  getAngleAt(t: number): number {
    if (this.angle == null) {
      this.angle = atan2(this.p1.y - this.p0.y, this.p1.x - this.p0.x);
    }
    return this.angle;
  }

  protected _validPoint() {
    return Number.isFinite(this.p0.x + this.p0.y + this.p1.x + this.p1.y);
  }

  protected calcLength(): number {
    if (this._validPoint()) {
      return PointService.distancePP(this.p0, this.p1);
    }
    // TODO 默认长度不好给，只能给个差不多的长度
    return 60;
  }

  protected calcProjLength(direction: IDirection): number {
    if (direction === Direction.ROW) {
      return abs(this.p0.x - this.p1.x);
    } else if (direction === Direction.COLUMN) {
      return abs(this.p0.y - this.p1.y);
    }
    return 0;
  }
}
