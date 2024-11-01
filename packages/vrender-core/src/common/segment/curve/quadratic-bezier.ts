import { CurveTypeEnum } from 'src/common/enums';
import type { IDirection, IQuadraticBezierCurve } from '../../../interface';
import { Curve } from './base';
import type { IPoint, IPointLike } from '@visactor/vutils';

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
  getPointAt(t: number): IPointLike {
    throw new Error('QuadraticBezierCurve暂不支持getPointAt');
  }
  protected calcLength(): number {
    throw new Error('QuadraticBezierCurve暂不支持updateLength');
  }
  protected calcProjLength(direction: IDirection): number {
    throw new Error('QuadraticBezierCurve暂不支持updateLength');
  }
  getAngleAt(t: number): number {
    throw new Error('ArcCurve暂不支持getAngleAt');
  }

  getYAt(x: number): number {
    throw new Error('QuadraticBezierCurve暂不支持getYAt');
  }
  includeX(x: number): boolean {
    throw new Error('QuadraticBezierCurve暂不支持includeX');
  }
}
