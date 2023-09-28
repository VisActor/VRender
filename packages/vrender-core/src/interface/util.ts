// import { IMatrix } from './matrix';

// export type IBoundsLike = Pick<IBounds, 'x1' | 'y1' | 'x2' | 'y2'>;
// export type IOBBBoundsLike = Pick<IOBBBounds, 'x1' | 'y1' | 'x2' | 'y2' | 'angle'>;

// export interface IBounds {
//   x1: number;
//   y1: number;
//   x2: number;
//   y2: number;
//   clone: () => IBounds;
//   clear: () => IBounds;
//   empty: () => boolean;
//   emptyMin: () => boolean;
//   equals: (b: IBounds) => boolean;
//   set: (x1: number, y1: number, x2: number, y2: number) => IBounds;
//   add: (x: number, y: number) => IBounds;
//   expand: (d: number) => IBounds;
//   round: () => IBounds;
//   translate: (dx: number, dy: number) => IBounds;
//   rotate: (angle: number, x: number, y: number) => IBounds;
//   scale: (sx: number, sy: number, x: number, y: number) => IBounds;
//   /**
//    * 并集
//    * @param b
//    * @returns
//    */
//   union: (b: IBounds) => IBounds;
//   /**
//    * 交集
//    * @param b
//    * @returns
//    */
//   intersect: (b: IBounds) => IBounds;
//   /**
//    * 是否包含b
//    * @param b
//    * @returns
//    */
//   encloses: (b: IBounds) => boolean;
//   /**
//    * 是否共边
//    * @param b
//    * @returns
//    */
//   alignsWith: (b: IBounds) => boolean;
//   /**
//    * 是否相交
//    * @param b
//    * @returns
//    */
//   intersects: (b: IBounds) => boolean;
//   /**
//    * 是否包含
//    * @param x
//    * @param y
//    * @returns
//    */
//   contains: (x: number, y: number) => boolean;
//   width: () => number;
//   height: () => number;
//   scaleX: (s: number) => IBounds;
//   scaleY: (s: number) => IBounds;

//   transformWithMatrix: (matrix: IMatrix) => IBounds;
// }

// export type IAABBBounds = IBounds;

// export interface IOBBBounds extends IBounds {
//   angle: number;
// }

// export type IPointLike = Pick<IPoint, 'x' | 'y' | 'x1' | 'y1'>;

// export interface IPoint {
//   x: number;
//   y: number;
//   x1?: number;
//   y1?: number;
//   // defined?: boolean;
//   add?: (point: IPoint | number) => IPoint;
//   sub?: (point: IPoint | number) => IPoint;
//   multi?: (point: IPoint | number) => IPoint;
//   div?: (point: IPoint | number) => IPoint;
//   length?: () => number;
// }

// export type vec2 = [number, number] | Float32Array;
// export type vec3 = [number, number, number] | Float32Array;
// export type vec4 = [number, number, number, number] | Float32Array;
// export type vec8 = [number, number, number, number, number, number, number, number] | Float32Array;

// export type RepeatType = 'no-repeat' | 'repeat' | 'stretch';
