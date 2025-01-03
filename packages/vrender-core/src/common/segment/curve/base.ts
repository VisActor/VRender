import type { IPoint, IPointLike } from '@visactor/vutils';
import type { IDirection, ICurve, IPath2D } from '../../../interface';

export abstract class Curve implements ICurve<IPoint> {
  type: number;
  readonly p0: IPoint;
  defined: boolean;

  protected length: number;
  abstract getPointAt(t: number): IPointLike;
  abstract getAngleAt(t: number): number;
  abstract getYAt(x: number): number;
  abstract includeX(x: number): boolean;
  getLength(direction?: IDirection): number {
    if (direction != null) {
      return this.calcProjLength(direction);
    }
    if (Number.isFinite(this.length)) {
      return this.length;
    }
    this.length = this.calcLength();
    return this.length;
  }
  protected abstract calcLength(): number;
  protected abstract calcProjLength(direction: IDirection): number;
  abstract draw(path: IPath2D, x: number, y: number, sx: number, sy: number, percent: number): void;
}
