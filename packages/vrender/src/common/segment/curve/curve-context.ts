import type { IPath2D, ICustomPath2D, ILineCurve, ICubicBezierCurve } from '../../../interface';
import { Point } from '@visactor/vutils';
import { LineCurve } from './line';
import { CubicBezierCurve } from './cubic-bezier';

export class CurveContext implements IPath2D {
  declare path: ICustomPath2D;
  private _lastX: number;
  private _lastY: number;
  private _startX: number;
  private _startY: number;

  constructor(path: ICustomPath2D) {
    this.path = path;
    this._lastX = this._lastY = this._startX = this._startY = 0;
  }
  moveTo(x: number, y: number) {
    this._lastX = this._startX = x;
    this._lastY = this._startY = y;
    return this;
  }
  lineTo(x: number, y: number) {
    const curve = this.addLinearCurve(x, y);
    this.path.curves.push(curve);
    this._lastX = x;
    this._lastY = y;
  }
  // linear
  protected addLinearCurve(x: number, y: number): ILineCurve {
    const curve = new LineCurve(new Point(this._lastX, this._lastY), new Point(x, y));
    return curve;
  }
  quadraticCurveTo(aCPx: number, aCPy: number, aX: number, aY: number) {
    throw new Error('CurveContext不支持调用quadraticCurveTo');
  }
  bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void {
    const curve: ICubicBezierCurve = new CubicBezierCurve(
      new Point(this._lastX, this._lastY),
      new Point(cp1x, cp1y),
      new Point(cp2x, cp2y),
      new Point(x, y)
    );
    this.path.curves.push(curve);
    this._lastX = x;
    this._lastY = y;
  }
  arcTo(aX1: number, aY1: number, aX2: number, aY2: number, aRadius: number) {
    throw new Error('CurveContext不支持调用arcTo');
  }
  ellipse(
    aX: number,
    aY: number,
    xRadius: number,
    yRadius: number,
    aRotation: number,
    aStartAngle: number,
    aEndAngle: number,
    aClockwise: boolean
  ) {
    throw new Error('CurveContext不支持调用ellipse');
  }
  rect(x: number, y: number, w: number, h: number) {
    throw new Error('CurveContext不支持调用rect');
  }
  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean) {
    throw new Error('CurveContext不支持调用arc');
  }
  closePath(): void {
    if (this.path.curves.length < 2) {
      return;
    }
    this.lineTo(this._startX, this._startY);
  }
}
