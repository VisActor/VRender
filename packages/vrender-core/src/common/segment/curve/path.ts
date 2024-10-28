import type { IAABBBounds, IPoint, IPointLike } from '@visactor/vutils';
import { AABBBounds } from '@visactor/vutils';
import type { ICurvePath, ICurve } from '../../../interface';

export class CurvePath implements ICurvePath<IPoint> {
  _curves: ICurve<IPoint>[];
  bounds: IAABBBounds;
  constructor() {
    this._curves = [];
    this.bounds = new AABBBounds();
  }
  get curves(): ICurve<IPoint>[] {
    return this._curves;
  }

  getCurveLengths(): number[] {
    return this._curves.map(curve => curve.getLength());
  }
  getPointAt(t: number): IPointLike {
    return { x: 0, y: 0 };
  }
  getLength(): number {
    return 0;
  }
  getBounds() {
    return this.bounds;
  }
}
