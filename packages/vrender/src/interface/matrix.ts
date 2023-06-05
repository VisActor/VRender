export type vec2 = [number, number] | Float32Array;
export type vec3 = [number, number, number] | Float32Array;
export type vec4 = [number, number, number, number] | Float32Array;
export type mat4 =
  | [
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number
    ]
  | Float32Array;

// import { IPoint } from '@visactor/vutils';

// // 不建议用户直接操作matrix
// export interface IMatrix {
//   /**
//    * scale x
//    */
//   a: number;
//   /**
//    * skew y
//    */
//   b: number;
//   /**
//    * skewx
//    */
//   c: number;
//   /**
//    * scale y
//    */
//   d: number;
//   /**
//    * translate x
//    */
//   e: number;
//   /**
//    * translate y
//    */
//   f: number;
//   // new (a?: number, b?: number, c?: number, d?: number, e?: number, f?: number): IMatrix;
//   setValue: (a: number, b: number, c: number, d: number, e: number, f: number) => IMatrix;
//   /**
//    * 获取当前矩阵的逆矩阵
//    */
//   getInverse: () => IMatrix;
//   rotate: (rad: number) => IMatrix;
//   scale: (sx: number, sy: number) => IMatrix;
//   setScale: (sx: number, sy: number) => IMatrix;
//   transform: (a: number, b: number, c: number, d: number, e: number, f: number) => IMatrix;
//   translate: (x: number, y: number) => IMatrix;
//   /**
//    * 矩阵相乘
//    * @param matrix
//    */
//   multiply: (a2: number, b2: number, c2: number, d2: number, e2: number, f2: number) => IMatrix;
//   /**
//    * 插值计算
//    * @param m2
//    * @param t
//    */
//   interpolate: (m2: IMatrix, t: number) => IMatrix;

//   // 将point转到当前矩阵的坐标空间中
//   transformPoint: (source: IPoint, target: IPoint) => void;

//   reset: () => IMatrix;

//   // 是否只有translate
//   onlyTranslate: () => boolean;

//   clone: () => IMatrix;
// }
