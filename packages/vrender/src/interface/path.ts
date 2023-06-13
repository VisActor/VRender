import type { IAABBBounds, IPoint, IPointLike } from '@visactor/vutils';
import type { Releaseable, IDirection } from './common';
import { CurveTypeEnum } from '../common/enums';

export const strCommandMap = [
  'arc',
  'arcTo',
  'bezierCurveTo',
  'closePath',
  'ellipse',
  'lineTo',
  'moveTo',
  'quadraticCurveTo',
  'rect'
];

export type CommandType = [
  number,
  (number | boolean)?,
  (number | boolean)?,
  (number | boolean)?,
  (number | boolean)?,
  (number | boolean)?,
  (number | boolean)?,
  (number | boolean)?,
  (number | boolean)?
];

export type CommandStrType = [
  string,
  (number | boolean)?,
  (number | boolean)?,
  (number | boolean)?,
  (number | boolean)?,
  (number | boolean)?,
  (number | boolean)?,
  (number | boolean)?,
  (number | boolean)?
];

export interface ICurve<T> {
  type: number;
  defined: boolean;
  readonly p0: T;
  readonly p1?: T;
  readonly p2?: T;
  readonly p3?: T;
  getPointAt: (t: number) => IPointLike;
  getAngleAt: (t: number) => number;
  getLength: (direction?: IDirection) => number;
}

export interface ICubicBezierCurve extends ICurve<IPoint> {
  type: CurveTypeEnum.CubicBezierCurve;
  // p0: IPoint;
  readonly p1: IPoint;
  readonly p2: IPoint;
  readonly p3: IPoint;
}

export interface IQuadraticBezierCurve extends ICurve<IPoint> {
  type: CurveTypeEnum.QuadraticBezierCurve;
  // p0: IPoint;
  readonly p1: IPoint;
  readonly p2: IPoint;
}

export interface IArcCurve extends ICurve<IPoint> {
  type: CurveTypeEnum.ArcCurve;
  // p0: IPoint;
  readonly p1: IPoint;
  radius: number;
}

export interface ILineCurve extends ICurve<IPoint> {
  type: CurveTypeEnum.LineCurve;
  // p0: IPoint;
  readonly p1: IPoint;
}

export interface IEllipseCurve extends ICurve<IPoint> {
  type: CurveTypeEnum.EllipseCurve;
  // p0: IPoint;
  radiusX: number;
  radiusY: number;
  rotation: number;
  startAngle: number;
  endAngle: number;
  anticlockwise?: boolean;
}

export interface IMoveCurve extends ICurve<IPoint> {
  type: CurveTypeEnum.MoveCurve;
  // p0: IPoint;
  readonly p1: IPoint;
}

export interface ICurvePath<T> {
  curves: ICurve<T>[];
  bounds?: IAABBBounds;
  getPointAt: (t: number) => IPointLike;
  getCurveLengths: () => number[];
  getLength: (direction?: IDirection) => number;
  getBounds?: () => IAABBBounds;
}

export interface IPath2D {
  moveTo: (x: number, y: number, z?: number) => void;
  lineTo: (x: number, y: number, z?: number) => void;
  quadraticCurveTo: (aCPx: number, aCPy: number, aX: number, aY: number, z?: number) => void;
  bezierCurveTo: (
    aCP1x: number,
    aCP1y: number,
    aCP2x: number,
    aCP2y: number,
    aX: number,
    aY: number,
    z?: number
  ) => void;
  arcTo: (aX1: number, aY1: number, aX2: number, aY2: number, aRadius: number, z?: number) => void;
  ellipse: (
    aX: number,
    aY: number,
    xRadius: number,
    yRadius: number,
    aRotation: number,
    aStartAngle: number,
    aEndAngle: number,
    aClockwise: boolean
  ) => void;
  rect: (x: number, y: number, w: number, h: number, z?: number) => void;
  arc: (
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    counterclockwise?: boolean,
    z?: number
  ) => void;
  closePath: () => void;
}

// 用户可以直接操作path2D
export interface ICustomPath2D extends ICurvePath<IPoint>, IPath2D, Releaseable {
  commandList: CommandType[];

  toString: () => string;
  transform: (x: number, y: number, sx: number, sy: number) => void;
  fromString: (pathStr: string, x?: number, y?: number, sX?: number, sY?: number) => ICustomPath2D;
  fromCustomPath2D: (path: ICustomPath2D, x?: number, y?: number, sX?: number, sY?: number) => ICustomPath2D;
  addCurve: (curve: ICurve<IPoint>) => void;
  clear: () => void;
}
