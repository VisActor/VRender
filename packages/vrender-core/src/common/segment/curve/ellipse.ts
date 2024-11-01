import type { IPoint, IPointLike } from '@visactor/vutils';
import type { IEllipseCurve, IDirection, IPath2D } from '../../../interface';
import { Curve } from './base';
import { CurveTypeEnum } from '../../enums';

export class EllipseCurve extends Curve implements IEllipseCurve {
  type: number = CurveTypeEnum.EllipseCurve;
  declare p0: IPoint;
  declare radiusX: number;
  declare radiusY: number;
  declare rotation: number;
  declare startAngle: number;
  declare endAngle: number;
  declare anticlockwise?: boolean;
  constructor(
    p0: IPoint,
    radiusX: number,
    radiusY: number,
    rotation: number,
    startAngle: number,
    endAngle: number,
    anticlockwise?: boolean
  ) {
    super();
    this.p0 = p0;
    this.radiusX = radiusX;
    this.radiusY = radiusY;
    this.rotation = rotation;
    this.startAngle = startAngle;
    this.endAngle = endAngle;
    this.anticlockwise = anticlockwise;
  }
  getPointAt(t: number): IPointLike {
    throw new Error('EllipseCurve暂不支持getPointAt');
  }
  getAngleAt(t: number): number {
    throw new Error('ArcCurve暂不支持getAngleAt');
  }
  protected calcLength(): number {
    throw new Error('EllipseCurve暂不支持updateLength');
  }
  protected calcProjLength(direction: IDirection): number {
    throw new Error('QuadraticBezierCurve暂不支持updateLength');
  }

  draw(path: IPath2D, percent: number) {
    throw new Error('暂不支持');
  }

  getYAt(x: number): number {
    throw new Error('QuadraticBezierCurve暂不支持getYAt');
  }
  includeX(x: number): boolean {
    throw new Error('QuadraticBezierCurve暂不支持includeX');
  }
}
