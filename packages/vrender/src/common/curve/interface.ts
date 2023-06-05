import { IPoint, IPointLike } from '@visactor/vutils';
import { ICurvePath, ICurveType } from '../../interface';
import { Direction } from '../seg-context';

/**
 * 用于segment的path2d接口，参数比普通的path多，部分path的方法不支持。
 */
export interface ISegPath2D extends ICurvePath<IPoint> {
  direction: Direction;
  curveType: ICurveType;

  endX: number;
  endY: number;

  tryUpdateLength: (direction?: Direction) => number;
  bezierCurveTo: (
    cp1x: number,
    cp1y: number,
    cp2x: number,
    cp2y: number,
    x: number,
    y: number,
    defined: boolean
  ) => void;
  closePath: () => void;
  ellipse: (
    x: number,
    y: number,
    radiusX: number,
    radiusY: number,
    rotation: number,
    startAngle: number,
    endAngle: number,
    counterclockwise?: boolean
  ) => void;
  lineTo: (x: number, y: number, defined: boolean) => void;
  moveTo: (x: number, y: number) => void;
  quadraticCurveTo: (cpx: number, cpy: number, x: number, y: number) => void;
}

export abstract class ACurveClass {
  context: ISegPath2D;
  abstract lineStart(): void;
  abstract lineEnd(): void;
  abstract areaStart(): void;
  abstract areaEnd(): void;
  _x: number;
  _y: number;
  _x0: number;
  _x1: number;
  _y0: number;
  _y1: number;
  _line: number;
  _point: number;
}
export abstract class ALinearTypeClass extends ACurveClass {
  abstract point(point: IPointLike): void;
  abstract tryUpdateLength(): number;
}

export abstract class ACurveTypeClass extends ACurveClass {
  abstract point(point: IPointLike): void;
}

export interface IGenSegmentParams {
  direction?: Direction;
  startPoint?: IPointLike;
}
