import type { ICustomPath2D } from '../path';
import type { IArcGraphicAttribute } from './arc';
import type { IAreaGraphicAttribute } from './area';
import type { ICircleGraphicAttribute } from './circle';
import type { IEllipseGraphicAttribute } from './ellipse';
import type { IIsogonGraphicAttribute } from './isogon';
import type { IPolygonGraphicAttribute } from './polygon';
import type { IRectGraphicAttribute } from './rect';

export declare function arcToPath(shape: IArcGraphicAttribute): ICustomPath2D;
export declare function areaToPath(shape: IAreaGraphicAttribute): ICustomPath2D;
export declare function circleToPath(shape: ICircleGraphicAttribute): ICustomPath2D;
export declare function ellipseToPath(shape: IEllipseGraphicAttribute): ICustomPath2D;
export declare function isogonToPath(shape: IIsogonGraphicAttribute): ICustomPath2D;
export declare function plygonToPath(shape: IPolygonGraphicAttribute): ICustomPath2D;
export declare function rectToPath(shape: IRectGraphicAttribute): ICustomPath2D;
