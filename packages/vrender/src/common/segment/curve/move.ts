import type { IPoint, IPointLike } from '@visactor/vutils';
import type { IMoveCurve, IDirection } from '../../../interface';
import { Curve } from './base';
import { CurveTypeEnum } from '../../enums';

export class MoveCurve extends Curve implements IMoveCurve {
  type: number = CurveTypeEnum.MoveCurve;
  declare p0: IPoint;
  declare p1: IPoint;
  constructor(p0: IPoint, p1: IPoint) {
    super();
    this.p0 = p0;
    this.p1 = p1;
  }
  getAngleAt(t: number): number {
    throw new Error('ArcCurve暂不支持getAngleAt');
  }
  getPointAt(t: number): IPointLike {
    throw new Error('MoveCurve暂不支持getPointAt');
  }
  protected calcLength(): number {
    throw new Error('MoveCurve暂不支持updateLength');
  }
  protected calcProjLength(direction: IDirection): number {
    throw new Error('QuadraticBezierCurve暂不支持updateLength');
  }
}
