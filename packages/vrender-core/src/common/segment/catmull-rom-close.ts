import { epsilon, type IPointLike } from '@visactor/vutils';
import { genLinearSegments } from './linear';
import { genCurveSegments, genSegContext } from './common';
import type { ICurvedSegment, IGenSegmentParams, ILinearSegment, ISegPath2D } from '../../interface/curve';
import { commonGenCatmullRomSegments, point } from './catmull-rom';

export class CatmullRomClosed implements ICurvedSegment {
  private _lastDefined1?: boolean;
  private _lastDefined2?: boolean;
  declare context: ISegPath2D;

  protected startPoint?: IPointLike;
  lastPoint0?: IPointLike;
  lastPoint1?: IPointLike;

  constructor(context: ISegPath2D, alpha: number = 0.5, startPoint?: IPointLike) {
    this.context = context;
    this.startPoint = startPoint;
    this._alpha = alpha;
  }
  _alpha: number;
  _x: number;
  _y: number;
  _x0: number;
  _x1: number;
  _y0: number;
  _y1: number;
  _x2: number;
  _y2: number;
  _x3: number;
  _y3: number;
  _x4: number;
  _y4: number;
  _x5: number;
  _y5: number;
  _line: number;
  _point: number;
  _l01_a: number;
  _l12_a: number;
  _l23_a: number;
  _l01_2a: number;
  _l12_2a: number;
  _l23_2a: number;

  areaStart() {
    this._line = 0;
  }
  areaEnd() {
    this._line = NaN;
  }
  lineStart() {
    this._x0 =
      this._x1 =
      this._x2 =
      this._x3 =
      this._x4 =
      this._x5 =
      this._y0 =
      this._y1 =
      this._y2 =
      this._y3 =
      this._y4 =
      this._y5 =
        NaN;
    this._l01_a = this._l12_a = this._l23_a = this._l01_2a = this._l12_2a = this._l23_2a = this._point = 0;
  }
  lineEnd() {
    switch (this._point) {
      case 1: {
        this.context.moveTo(this._x3, this._y3, this.lastPoint1);
        this.context.closePath();
        break;
      }
      case 2: {
        this.context.lineTo(
          this._x3,
          this._y3,
          this._lastDefined1 !== false && this._lastDefined2 !== false,
          this.lastPoint1
        );
        this.context.closePath();
        break;
      }
      case 3: {
        this.point({ x: this._x3, y: this._y3 });
        this.point({ x: this._x4, y: this._y4 });
        this.point({ x: this._x5, y: this._y5 });
        break;
      }
    }
  }
  point(p: IPointLike): void {
    const { x, y } = p;

    if (this._point) {
      const x23 = this._x2 - x;
      const y23 = this._y2 - y;
      this._l23_a = Math.sqrt((this._l23_2a = Math.pow(x23 * x23 + y23 * y23, this._alpha)));
    }

    switch (this._point) {
      case 0:
        this._point = 1;
        (this._x3 = x), (this._y3 = y);
        break;
      case 1:
        this._point = 2;
        this.context.moveTo((this._x4 = x), (this._y4 = y), p);
        break;
      case 2:
        this._point = 3;
        (this._x5 = x), (this._y5 = y);
        break;
      default:
        point(this as any, x, y, this._lastDefined1 !== false && this._lastDefined2 !== false, p);
        break;
    }

    (this._l01_a = this._l12_a), (this._l12_a = this._l23_a);
    (this._l01_2a = this._l12_2a), (this._l12_2a = this._l23_2a);
    (this._x0 = this._x1), (this._x1 = this._x2), (this._x2 = x);
    (this._y0 = this._y1), (this._y1 = this._y2), (this._y2 = y);

    this._lastDefined1 = this._lastDefined2;
    this._lastDefined2 = p.defined;
    this.lastPoint0 = this.lastPoint1;
    this.lastPoint1 = p;
  }

  tryUpdateLength(): number {
    return this.context.tryUpdateLength();
  }
}

// export function genCatmullRomClosedTypeSegments(path: ILinearSegment, points: IPointLike[]): void {
//   return genCurveSegments(path, points, 2);
// }

export const genCatmullRomClosedSegments = commonGenCatmullRomSegments('catmullRomClosed', CatmullRomClosed);

// export function genCatmullRomClosedSegments(
//   points: IPointLike[],
//   alpha: number,
//   params: IGenSegmentParams = {}
// ): ISegPath2D | null {
//   const { direction, startPoint } = params;
//   if (points.length < 2 - Number(!!startPoint)) {
//     return null;
//   }
//   if (points.length < 3 - Number(!!startPoint)) {
//     return genLinearSegments(points, params);
//   }

//   const segContext = genSegContext('catmullRom', direction, points);

//   const gatmullRom = new CatmullRomClosed(segContext, alpha, startPoint);

//   genCatmullRomClosedTypeSegments(gatmullRom, points);

//   return segContext;
// }
