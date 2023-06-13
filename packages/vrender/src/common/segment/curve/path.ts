import type { IAABBBounds, IPoint, IPointLike } from '@visactor/vutils';
import { AABBBounds } from '@visactor/vutils';
import type { ICurvePath, ICurve } from '../../../interface';

export class CurvePath implements ICurvePath<IPoint> {
  curves: ICurve<IPoint>[];
  bounds: IAABBBounds;
  constructor() {
    this.curves = [];
    this.bounds = new AABBBounds();
  }
  getCurveLengths(): number[] {
    return this.curves.map(curve => curve.getLength());
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
