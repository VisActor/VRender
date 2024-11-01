import { CurveTypeEnum } from 'src/common/enums';
import type { IDirection, IArcCurve } from '../../../interface';
import { Curve } from './base';
import type { IPoint, IPointLike } from '@visactor/vutils';

export class ArcCurve extends Curve implements IArcCurve {
  type: number = CurveTypeEnum.ArcCurve;
  declare readonly p0: IPoint;
  declare readonly p1: IPoint;
  declare radius: number;
  constructor(p0: IPoint, p1: IPoint, radius: number) {
    super();
    this.p0 = p0;
    this.p1 = p1;
    this.radius = radius;
  }
  getPointAt(t: number): IPointLike {
    throw new Error('ArcCurve暂不支持getPointAt');
  }
  protected calcLength(): number {
    throw new Error('ArcCurve暂不支持updateLength');
  }
  protected calcProjLength(direction: IDirection): number {
    throw new Error('QuadraticBezierCurve暂不支持updateLength');
  }
  getAngleAt(t: number): number {
    throw new Error('ArcCurve暂不支持getAngleAt');
  }
  getYAt(x: number): number {
    throw new Error('ArcCurve暂不支持getYAt');
  }
  includeX(x: number): boolean {
    throw new Error('ArcCurve暂不支持includeX');
  }
}
