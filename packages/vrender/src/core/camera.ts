import { epsilon, IPoint, IPointLike } from '@visactor/vutils';
import { DefaultMat4Allocate } from '../allocator/matrix-allocate';
import { ICamera, mat4, OrthoParameters, vec3 } from '../interface';
import { mat4Allocate } from '../modules';

/**
 * 部分代码参考 https://github.com/toji/gl-matrix
 * Copyright (c) 2015-2021, Brandon Jones, Colin MacKenzie IV.

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
 */

/**
 * 代码来自gl-matrix https://github.com/toji/gl-matrix
 * Generates a matrix that makes something look at something else.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {ReadonlyVec3} eye Position of the viewer
 * @param {ReadonlyVec3} center Point the viewer is looking at
 * @param {ReadonlyVec3} up vec3 pointing up
 * @returns {mat4} out
 */

function targetTo(out: mat4, eye: vec3, target: vec3, up: vec3) {
  const eyex = eye[0];
  const eyey = eye[1];
  const eyez = eye[2];
  const upx = up[0];
  const upy = up[1];
  const upz = up[2];
  let z0 = eyex - target[0];
  let z1 = eyey - target[1];
  let z2 = eyez - target[2];
  let len = z0 * z0 + z1 * z1 + z2 * z2;

  if (len > 0) {
    len = 1 / Math.sqrt(len);
    z0 *= len;
    z1 *= len;
    z2 *= len;
  }

  let x0 = upy * z2 - upz * z1;
  let x1 = upz * z0 - upx * z2;
  let x2 = upx * z1 - upy * z0;
  len = x0 * x0 + x1 * x1 + x2 * x2;

  if (len > 0) {
    len = 1 / Math.sqrt(len);
    x0 *= len;
    x1 *= len;
    x2 *= len;
  }

  out[0] = x0;
  out[1] = x1;
  out[2] = x2;
  out[3] = 0;
  out[4] = z1 * x2 - z2 * x1;
  out[5] = z2 * x0 - z0 * x2;
  out[6] = z0 * x1 - z1 * x0;
  out[7] = 0;
  out[8] = z0;
  out[9] = z1;
  out[10] = z2;
  out[11] = 0;
  out[12] = eyex;
  out[13] = eyey;
  out[14] = eyez;
  out[15] = 1;
  return out;
}

// 代码来自gl-matrix https://github.com/toji/gl-matrix
function lookAt(out: mat4, eye: vec3, center: vec3, up: vec3) {
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

function ortho(out: mat4, left: number, right: number, bottom: number, top: number, near: number, far: number) {
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
 * Multiplies two mat4s
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the first operand
 * @param {ReadonlyMat4} b the second operand
 * @returns {mat4} out
 */

export function multiply(out: mat4, a: mat4, b: mat4) {
  const a00 = a[0];
  const a01 = a[1];
  const a02 = a[2];
  const a03 = a[3];
  const a10 = a[4];
  const a11 = a[5];
  const a12 = a[6];
  const a13 = a[7];
  const a20 = a[8];
  const a21 = a[9];
  const a22 = a[10];
  const a23 = a[11];
  const a30 = a[12];
  const a31 = a[13];
  const a32 = a[14];
  const a33 = a[15]; // Cache only the current line of the second matrix

  let b0 = b[0];
  let b1 = b[1];
  let b2 = b[2];
  let b3 = b[3];
  out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[4];
  b1 = b[5];
  b2 = b[6];
  b3 = b[7];
  out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[8];
  b1 = b[9];
  b2 = b[10];
  b3 = b[11];
  out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[12];
  b1 = b[13];
  b2 = b[14];
  b3 = b[15];
  out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
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

/**
 * 正交投影摄像机
 */
export class OrthoCamera implements ICamera {
  private _params: OrthoParameters;

  /* cache */
  private _projectionMatrixCached: mat4;
  private _viewMatrixCached: mat4;
  private _vp: mat4;

  set params(params: OrthoParameters) {
    this._params = { ...params };
    this._projectionMatrixCached = this.forceGetProjectionMatrix();
    this._viewMatrixCached = this.forceGetViewMatrix();
  }
  get params(): OrthoParameters {
    return { ...this._params };
  }

  constructor(params: OrthoParameters) {
    this.params = params;
  }

  /**
   * 获取视图矩阵
   */
  getViewMatrix(): mat4 {
    if (!this._viewMatrixCached) {
      this._viewMatrixCached = mat4Allocate.allocate();
    }
    return this._viewMatrixCached;
  }
  forceGetViewMatrix(): mat4 {
    if (!this._viewMatrixCached) {
      this._viewMatrixCached = mat4Allocate.allocate();
    }
    const { pos, center, up } = this.params.viewParams;
    lookAt(this._viewMatrixCached, pos, center, up);

    if (!this._vp) {
      this._vp = mat4Allocate.allocate();
    }
    this._vp = multiply(this._vp, this.getProjectionMatrix(), this.getViewMatrix());
    return this._viewMatrixCached;
  }

  /**
   * 获取projection矩阵
   */
  getProjectionMatrix(): mat4 {
    if (!this._projectionMatrixCached) {
      this._projectionMatrixCached = mat4Allocate.allocate();
    }
    return this._projectionMatrixCached;
  }
  forceGetProjectionMatrix(): mat4 {
    if (!this._projectionMatrixCached) {
      this._projectionMatrixCached = mat4Allocate.allocate();
    }
    const { left, top, right, bottom } = this._params;
    // 从0到2000000的Z轴范围，小于0的会被裁剪
    ortho(this._projectionMatrixCached, left, right, bottom, top, 0.0, -2000000.0);

    if (!this._vp) {
      this._vp = mat4Allocate.allocate();
    }
    this._vp = multiply(this._vp, this.getProjectionMatrix(), this.getViewMatrix());
    return this._projectionMatrixCached;
  }

  getField() {
    const { fieldRatio = 0.8, fieldDepth, left, right } = this._params;
    return (fieldDepth ?? right - left) * fieldRatio;
  }

  getProjectionScale(z: number): number {
    const field = this.getField();
    return field / (field + z);
  }

  view(x: number, y: number, z: number): [number, number, number] {
    const outP: vec3 = [0, 0, 0];
    transformMat4(outP, [x, y, z], this._viewMatrixCached);
    return outP;
  }

  // 部分参考：https://www.mamboleoo.be/articles/how-to-render-3d-in-2d-canvas
  vp(x: number, y: number, z: number): IPointLike {
    const outP: vec3 = [0, 0, 0];
    const { pos } = this._params.viewParams;
    transformMat4(outP, [x, y, z], this._viewMatrixCached);
    x = outP[0];
    y = outP[1];
    z = outP[2];

    const sizeProjection = this.getProjectionScale(z);
    const xProject = x * sizeProjection + pos[0];
    const yProject = y * sizeProjection + pos[1];
    return {
      x: xProject,
      y: yProject
    };
  }
}
