import type { IPointLike } from '@visactor/vutils';
import type { ICamera, mat4, OrthoParameters, vec3 } from '../interface';
import { mat4Allocate } from '../allocator/matrix-allocate';
import { lookAt, ortho, transformMat4 } from '../common/matrix';
import { Factory } from '../factory';
import { multiplyMat4Mat4 } from '../common/matrix';

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

// /**
//  * 代码来自gl-matrix https://github.com/toji/gl-matrix
//  * Generates a matrix that makes something look at something else.
//  *
//  * @param {mat4} out mat4 frustum matrix will be written into
//  * @param {ReadonlyVec3} eye Position of the viewer
//  * @param {ReadonlyVec3} center Point the viewer is looking at
//  * @param {ReadonlyVec3} up vec3 pointing up
//  * @returns {mat4} out
//  */

// function targetTo(out: mat4, eye: vec3, target: vec3, up: vec3) {
//   const eyex = eye[0];
//   const eyey = eye[1];
//   const eyez = eye[2];
//   const upx = up[0];
//   const upy = up[1];
//   const upz = up[2];
//   let z0 = eyex - target[0];
//   let z1 = eyey - target[1];
//   let z2 = eyez - target[2];
//   let len = z0 * z0 + z1 * z1 + z2 * z2;

//   if (len > 0) {
//     len = 1 / Math.sqrt(len);
//     z0 *= len;
//     z1 *= len;
//     z2 *= len;
//   }

//   let x0 = upy * z2 - upz * z1;
//   let x1 = upz * z0 - upx * z2;
//   let x2 = upx * z1 - upy * z0;
//   len = x0 * x0 + x1 * x1 + x2 * x2;

//   if (len > 0) {
//     len = 1 / Math.sqrt(len);
//     x0 *= len;
//     x1 *= len;
//     x2 *= len;
//   }

//   out[0] = x0;
//   out[1] = x1;
//   out[2] = x2;
//   out[3] = 0;
//   out[4] = z1 * x2 - z2 * x1;
//   out[5] = z2 * x0 - z0 * x2;
//   out[6] = z0 * x1 - z1 * x0;
//   out[7] = 0;
//   out[8] = z0;
//   out[9] = z1;
//   out[10] = z2;
//   out[11] = 0;
//   out[12] = eyex;
//   out[13] = eyey;
//   out[14] = eyez;
//   out[15] = 1;
//   return out;
// }

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
    this._vp = multiplyMat4Mat4(this._vp, this.getProjectionMatrix(), this.getViewMatrix());
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
    this._vp = multiplyMat4Mat4(this._vp, this.getProjectionMatrix(), this.getViewMatrix());
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

export const registerOrthoCamera = () => {
  Factory.registerPlugin('OrthoCamera', OrthoCamera);
};
