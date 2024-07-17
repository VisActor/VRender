// import { abs, cos, epsilon, sin } from '@visactor/vutils';
// import { IMatrix } from '../interface/matrix';
// import { IBounds, IPoint } from '../interface/util';

import type { mat4, vec3 } from '@visactor/vutils';
import { epsilon } from '@visactor/vutils';
import { DefaultMat4Allocate } from '../allocator/matrix-allocate';

// export type vec2 = [number, number] | Float32Array;
// export type vec3 = [number, number, number] | Float32Array;
// export type vec4 = [number, number, number, number] | Float32Array;
// export type mat4 =
//   | [
//       number,
//       number,
//       number,
//       number,
//       number,
//       number,
//       number,
//       number,
//       number,
//       number,
//       number,
//       number,
//       number,
//       number,
//       number,
//       number
//     ]
//   | Float32Array;

// export class Matrix implements IMatrix {
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

//   // todo setScale需要sx,sy初始值为1
//   constructor(a?: number, b?: number, c?: number, d?: number, e?: number, f?: number) {
//     // 暂时不需要初始化
//     this.a = a ?? 1;
//     this.b = b ?? 0;
//     this.c = c ?? 0;
//     this.d = d ?? 1;
//     this.e = e ?? 0;
//     this.f = f ?? 0;
//   }

//   setValue(a: number, b: number, c: number, d: number, e: number, f: number) {
//     this.a = a;
//     this.b = b;
//     this.c = c;
//     this.d = d;
//     this.e = e;
//     this.f = f;
//     return this;
//   }

//   reset(): this {
//     this.a = 1;
//     this.b = 0;
//     this.c = 0;
//     this.d = 1;
//     this.e = 0;
//     this.f = 0;
//     return this;
//   }

//   /**
//    * 获取当前矩阵的逆矩阵
//    */
//   getInverse() {
//     const a = this.a;
//     const b = this.b;
//     const c = this.c;
//     const d = this.d;
//     const e = this.e;
//     const f = this.f;
//     const m = new Matrix();
//     const dt = a * d - b * c;

//     m.a = d / dt;
//     m.b = -b / dt;
//     m.c = -c / dt;
//     m.d = a / dt;
//     m.e = (c * f - d * e) / dt;
//     m.f = -(a * f - b * e) / dt;

//     return m;
//   }

//   rotate(rad: number) {
//     const c = Math.cos(rad);
//     const s = Math.sin(rad);
//     const m11 = this.a * c + this.c * s;
//     const m12 = this.b * c + this.d * s;
//     const m21 = this.a * -s + this.c * c;
//     const m22 = this.b * -s + this.d * c;
//     this.a = m11;
//     this.b = m12;
//     this.c = m21;
//     this.d = m22;
//     return this;
//   }

//   scale(sx: number, sy: number) {
//     this.a *= sx;
//     this.b *= sx;
//     this.c *= sy;
//     this.d *= sy;
//     return this;
//   }

//   setScale(sx: number, sy: number) {
//     this.b = (this.b / this.a) * sx;
//     this.c = (this.c / this.d) * sy;
//     this.a = sx;
//     this.d = sy;
//     return this;
//   }

//   transform(a: number, b: number, c: number, d: number, e: number, f: number) {
//     this.multiply(a, b, c, d, e, f);
//     return this;
//   }
//   translate(x: number, y: number) {
//     this.e += this.a * x + this.c * y;
//     this.f += this.b * x + this.d * y;
//     return this;
//   }
//   /**
//    * 矩阵相乘
//    * @param matrix
//    */
//   multiply(a2: number, b2: number, c2: number, d2: number, e2: number, f2: number) {
//     const a1 = this.a;
//     const b1 = this.b;
//     const c1 = this.c;
//     const d1 = this.d;
//     const e1 = this.e;
//     const f1 = this.f;

//     const m11 = a1 * a2 + c1 * b2;
//     const m12 = b1 * a2 + d1 * b2;
//     const m21 = a1 * c2 + c1 * d2;
//     const m22 = b1 * c2 + d1 * d2;
//     const dx = a1 * e2 + c1 * f2 + e1;
//     const dy = b1 * e2 + d1 * f2 + f1;

//     this.a = m11;
//     this.b = m12;
//     this.c = m21;
//     this.d = m22;
//     this.e = dx;
//     this.f = dy;
//     return this;
//   }
//   /**
//    * 插值计算
//    * @param m2
//    * @param t
//    */
//   interpolate(m2: Matrix, t: number) {
//     const m = new Matrix();

//     m.a = this.a + (m2.a - this.a) * t;
//     m.b = this.b + (m2.b - this.b) * t;
//     m.c = this.c + (m2.c - this.c) * t;
//     m.d = this.d + (m2.d - this.d) * t;
//     m.e = this.e + (m2.e - this.e) * t;
//     m.f = this.f + (m2.f - this.f) * t;

//     return m;
//   }

//   /**
//    * 将point转到当前矩阵的坐标空间中
//    * @param source
//    * @param target
//    */
//   transformPoint(source: IPoint, target: IPoint) {
//     const { a, b, c, d, e, f } = this;
//     const dt = a * d - b * c;

//     const nextA = d / dt;
//     const nextB = -b / dt;
//     const nextC = -c / dt;
//     const nextD = a / dt;
//     const nextE = (c * f - d * e) / dt;
//     const nextF = -(a * f - b * e) / dt;

//     const { x, y } = source;
//     target.x = x * nextA + y * nextC + nextE;
//     target.y = x * nextB + y * nextD + nextF;
//   }

//   // 只有translate
//   onlyTranslate(): boolean {
//     return this.a === 1 && this.b === 0 && this.c === 0 && this.d === 1;
//   }

//   clone(): Matrix {
//     return new Matrix(this.a, this.b, this.c, this.d, this.e, this.f);
//   }
// }

// /**
//  * 依据graphic的属性对bounds进行变换
//  * @param bounds
//  * @param x
//  * @param y
//  * @param scaleX
//  * @param scaleY
//  * @param angle
//  * @param rotateCenter
//  */
// export function transformBounds(
//   bounds: IBounds,
//   x: number,
//   y: number,
//   scaleX: number,
//   scaleY: number,
//   angle: number,
//   rotateCenter?: [number, number]
// ) {
//   if (abs(scaleX) <= epsilon || abs(scaleY) <= epsilon) {
//     return;
//   }

//   scaleX !== 1 && bounds.scaleX(scaleX);
//   scaleY !== 1 && bounds.scaleY(scaleY);

//   if (isFinite(angle) && Math.abs(angle) > epsilon) {
//     let rx = 0;
//     let ry = 0;
//     if (rotateCenter !== undefined) {
//       rx = rotateCenter[0];
//       ry = rotateCenter[1];
//     }
//     bounds.rotate(angle, rx, ry);
//   }

//   bounds.translate(x, y);
// }
// export function transformBoundsWithMatrix(bounds: IBounds, matrix: IMatrix): IBounds {
//   const { x1, y1, x2, y2 } = bounds;
//   // 如果没有旋转和缩放，那就直接translate
//   if (matrix.onlyTranslate()) {
//     bounds.translate(matrix.e, matrix.f);
//     return bounds;
//   }
//   bounds.x1 = matrix.a * x1 + matrix.c * y1 + matrix.e;
//   bounds.y1 = matrix.b * x1 + matrix.d * y1 + matrix.f;
//   bounds.x2 = matrix.a * x2 + matrix.c * y2 + matrix.e;
//   bounds.y2 = matrix.b * x2 + matrix.d * y2 + matrix.f;
//   bounds.clear();
//   bounds.add(x1, y1);
//   bounds.add(x2, y2);
//   return bounds;
// }

// export function normalTransform(
//   out: Matrix,
//   origin: Matrix,
//   x: number,
//   y: number,
//   scaleX: number,
//   scaleY: number,
//   angle: number,
//   rotateCenter?: vec2
// ) {
//   const oa = origin.a;
//   const ob = origin.b;
//   const oc = origin.c;
//   const od = origin.d;
//   const oe = origin.e;
//   const of = origin.f;
//   const cosTheta = cos(angle);
//   const sinTheta = sin(angle);
//   let rotateCenterX: number;
//   let rotateCenterY: number;
//   if (rotateCenter) {
//     rotateCenterX = rotateCenter[0];
//     rotateCenterY = rotateCenter[1];
//   } else {
//     rotateCenterX = x;
//     rotateCenterY = y;
//   }
//   const offsetX = rotateCenterX - x;
//   const offsetY = rotateCenterY - y;

//   const a1 = oa * cosTheta + oc * sinTheta;
//   const b1 = ob * cosTheta + od * sinTheta;
//   const c1 = oc * cosTheta - oa * sinTheta;
//   const d1 = od * cosTheta - ob * sinTheta;
//   out.a = scaleX * a1;
//   out.b = scaleX * b1;
//   out.c = scaleY * c1;
//   out.d = scaleY * d1;

//   out.e = oe + oa * rotateCenterX + oc * rotateCenterY - a1 * offsetX - c1 * offsetY;
//   out.f = of + ob * rotateCenterX + od * rotateCenterY - b1 * offsetX - d1 * offsetY;
// }
// 代码来自gl-matrix https://github.com/toji/gl-matrix
export function lookAt(out: mat4, eye: vec3, center: vec3, up: vec3) {
  let x0;
  let x1;
  let x2;
  let y0;
  let y1;
  let y2;
  let z0;
  let z1;
  let z2;
  let len;
  const eyex = eye[0];
  const eyey = eye[1];
  const eyez = eye[2];
  const upx = up[0];
  const upy = up[1];
  const upz = up[2];
  const centerx = center[0];
  const centery = center[1];
  const centerz = center[2];

  if (Math.abs(eyex - centerx) < epsilon && Math.abs(eyey - centery) < epsilon && Math.abs(eyez - centerz) < epsilon) {
    return DefaultMat4Allocate.identity(out);
  }

  z0 = eyex - centerx;
  z1 = eyey - centery;
  z2 = eyez - centerz;
  len = 1 / Math.hypot(z0, z1, z2);
  z0 *= len;
  z1 *= len;
  z2 *= len;
  x0 = upy * z2 - upz * z1;
  x1 = upz * z0 - upx * z2;
  x2 = upx * z1 - upy * z0;
  len = Math.hypot(x0, x1, x2);

  if (!len) {
    x0 = 0;
    x1 = 0;
    x2 = 0;
  } else {
    len = 1 / len;
    x0 *= len;
    x1 *= len;
    x2 *= len;
  }

  y0 = z1 * x2 - z2 * x1;
  y1 = z2 * x0 - z0 * x2;
  y2 = z0 * x1 - z1 * x0;
  len = Math.hypot(y0, y1, y2);

  if (!len) {
    y0 = 0;
    y1 = 0;
    y2 = 0;
  } else {
    len = 1 / len;
    y0 *= len;
    y1 *= len;
    y2 *= len;
  }

  out[0] = x0;
  out[1] = y0;
  out[2] = z0;
  out[3] = 0;
  out[4] = x1;
  out[5] = y1;
  out[6] = z1;
  out[7] = 0;
  out[8] = x2;
  out[9] = y2;
  out[10] = z2;
  out[11] = 0;
  out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
  out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
  out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
  out[15] = 1;
  return out;
}

/**
 * 代码来自gl-matrix https://github.com/toji/gl-matrix
 * Generates a orthogonal projection matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} left Left bound of the frustum
 * @param {number} right Right bound of the frustum
 * @param {number} bottom Bottom bound of the frustum
 * @param {number} top Top bound of the frustum
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */

export function ortho(out: mat4, left: number, right: number, bottom: number, top: number, near: number, far: number) {
  const lr = 1 / (left - right);
  const bt = 1 / (bottom - top);
  const nf = 1 / (near - far);
  out[0] = -2 * lr;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = -2 * bt;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 2 * nf;
  out[11] = 0;
  out[12] = (left + right) * lr;
  out[13] = (top + bottom) * bt;
  out[14] = (far + near) * nf;
  out[15] = 1;
  return out;
}
/**
 * 代码来自gl-matrix https://github.com/toji/gl-matrix
 * Transforms the vec3 with a mat4.
 * 4th vector component is implicitly '1'
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec3} a the vector to transform
 * @param {ReadonlyMat4} m matrix to transform with
 * @returns {vec3} out
 */

export function transformMat4(out: vec3, a: vec3, m: mat4) {
  const x = a[0];
  const y = a[1];
  const z = a[2];
  let w = m[3] * x + m[7] * y + m[11] * z + m[15];
  w = w || 1.0;
  out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
  out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
  out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
  return out;
}
