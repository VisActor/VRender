import { inject, injectable, named } from '../../common/inversify-lite';
import type { IAABBBounds, IBounds, IMatrix } from '@visactor/vutils';
import { AABBBounds, epsilon, isArray, pi2, transformBoundsWithMatrix } from '@visactor/vutils';
import { SyncHook } from '../../tapable';
import type {
  mat4,
  vec3,
  IArc,
  IArcGraphicAttribute,
  IArea,
  IAreaGraphicAttribute,
  IGraphicAttribute,
  ICircle,
  ICircleGraphicAttribute,
  IGraphic,
  IGroup,
  IGroupGraphicAttribute,
  ILine,
  ILineGraphicAttribute,
  IPath,
  IPathGraphicAttribute,
  IPolygon,
  IPolygonGraphicAttribute,
  IRectGraphicAttribute,
  IStage,
  ISymbol,
  ISymbolGraphicAttribute,
  IText,
  ITextGraphicAttribute,
  IGlyph,
  IGlyphGraphicAttribute,
  IRichTextGraphicAttribute,
  IRichText,
  IPyramid3dGraphicAttribute,
  IPyramid3d,
  IArc3dGraphicAttribute,
  IArc3d,
  IImageGraphicAttribute,
  ITransform,
  IGraphicService,
  IGraphicCreator,
  ISyncHook,
  IRectBoundsContribution,
  ISymbolBoundsContribution,
  ICircleBoundsContribution,
  IArcBoundsContribution,
  IPathBoundsContribution,
  IContributionProvider
} from '../../interface';
import { RectBoundsContribution } from './rect-contribution';
import { textDrawOffsetX } from '../../common/text';
import { SymbolBoundsContribution } from './symbol-contribution';
import { boundStroke } from '../tools';
import { CircleBoundsContribution } from './circle-contribution';
import { ArcBoundsContribution } from './arc-contribution';
import { PathBoundsContribution } from './path-contribution';
import { mat4Allocate } from '../../allocator/matrix-allocate';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ContributionProvider } from '../../common/contribution-provider';
import { BoundsContext } from '../../common/bounds-context';
import { renderCommandList } from '../../common/render-command-list';
import { circleBounds } from '../../common/utils';
import { GraphicCreator } from '../constants';

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

// 代码来自gl-matrix https://github.com/toji/gl-matrix
function identity(out: mat4) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}

/**
 * 代码来自gl-matrix https://github.com/toji/gl-matrix
 * Rotates a matrix by the given angle around the X axis
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
export function rotateX(out: mat4, a: mat4, rad: number) {
  const s = Math.sin(rad);
  const c = Math.cos(rad);
  const a10 = a[4];
  const a11 = a[5];
  const a12 = a[6];
  const a13 = a[7];
  const a20 = a[8];
  const a21 = a[9];
  const a22 = a[10];
  const a23 = a[11];
  if (a !== out) {
    // If the source and destination differ, copy the unchanged rows
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  }
  // Perform axis-specific matrix multiplication
  out[4] = a10 * c + a20 * s;
  out[5] = a11 * c + a21 * s;
  out[6] = a12 * c + a22 * s;
  out[7] = a13 * c + a23 * s;
  out[8] = a20 * c - a10 * s;
  out[9] = a21 * c - a11 * s;
  out[10] = a22 * c - a12 * s;
  out[11] = a23 * c - a13 * s;
  return out;
}

/**
 * 代码来自gl-matrix https://github.com/toji/gl-matrix
 * Rotates a matrix by the given angle around the Y axis
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
export function rotateY(out: mat4, a: mat4, rad: number) {
  const s = Math.sin(rad);
  const c = Math.cos(rad);
  const a00 = a[0];
  const a01 = a[1];
  const a02 = a[2];
  const a03 = a[3];
  const a20 = a[8];
  const a21 = a[9];
  const a22 = a[10];
  const a23 = a[11];
  if (a !== out) {
    // If the source and destination differ, copy the unchanged rows
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  }
  // Perform axis-specific matrix multiplication
  out[0] = a00 * c - a20 * s;
  out[1] = a01 * c - a21 * s;
  out[2] = a02 * c - a22 * s;
  out[3] = a03 * c - a23 * s;
  out[8] = a00 * s + a20 * c;
  out[9] = a01 * s + a21 * c;
  out[10] = a02 * s + a22 * c;
  out[11] = a03 * s + a23 * c;
  return out;
}

/**
 * 代码来自gl-matrix https://github.com/toji/gl-matrix
 * Rotates a matrix by the given angle around the Z axis
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
function rotateZ(out: mat4, a: mat4, rad: number) {
  const s = Math.sin(rad);
  const c = Math.cos(rad);
  const a00 = a[0];
  const a01 = a[1];
  const a02 = a[2];
  const a03 = a[3];
  const a10 = a[4];
  const a11 = a[5];
  const a12 = a[6];
  const a13 = a[7];

  if (a !== out) {
    // If the source and destination differ, copy the unchanged last row
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  } // Perform axis-specific matrix multiplication

  out[0] = a00 * c + a10 * s;
  out[1] = a01 * c + a11 * s;
  out[2] = a02 * c + a12 * s;
  out[3] = a03 * c + a13 * s;
  out[4] = a10 * c - a00 * s;
  out[5] = a11 * c - a01 * s;
  out[6] = a12 * c - a02 * s;
  out[7] = a13 * c - a03 * s;
  return out;
}

// 代码来自gl-matrix https://github.com/toji/gl-matrix
export function translate(out: mat4, a: mat4, v: vec3) {
  const x = v[0];
  const y = v[1];
  const z = v[2];
  let a00;
  let a01;
  let a02;
  let a03;
  let a10;
  let a11;
  let a12;
  let a13;
  let a20;
  let a21;
  let a22;
  let a23;
  if (a === out) {
    out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
    out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
    out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
    out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
  } else {
    a00 = a[0];
    a01 = a[1];
    a02 = a[2];
    a03 = a[3];
    a10 = a[4];
    a11 = a[5];
    a12 = a[6];
    a13 = a[7];
    a20 = a[8];
    a21 = a[9];
    a22 = a[10];
    a23 = a[11];
    out[0] = a00;
    out[1] = a01;
    out[2] = a02;
    out[3] = a03;
    out[4] = a10;
    out[5] = a11;
    out[6] = a12;
    out[7] = a13;
    out[8] = a20;
    out[9] = a21;
    out[10] = a22;
    out[11] = a23;
    out[12] = a00 * x + a10 * y + a20 * z + a[12];
    out[13] = a01 * x + a11 * y + a21 * z + a[13];
    out[14] = a02 * x + a12 * y + a22 * z + a[14];
    out[15] = a03 * x + a13 * y + a23 * z + a[15];
  }
  return out;
}

export function mat3Tomat4(out: mat4, b: IMatrix) {
  out[0] = b.a;
  out[1] = b.b;
  out[2] = 0;
  out[3] = 0;
  out[4] = b.c;
  out[5] = b.d;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = b.e;
  out[13] = b.f;
  out[14] = 0;
  out[15] = 1;
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

export function multiplyMat4Mat3(out: mat4, a: mat4, b: IMatrix) {
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

  let b0 = b.a;
  let b1 = b.b;
  let b2 = 0;
  let b3 = 0;
  out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b.c;
  b1 = b.d;
  b2 = 0;
  b3 = 0;
  out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = 0;
  b1 = 0;
  b2 = 1;
  b3 = 0;
  out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b.e;
  b1 = b.f;
  b2 = 0;
  b3 = 1;
  out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  return out;
}

/**
 * 代码来自gl-matrix https://github.com/toji/gl-matrix
 * Scales the mat4 by the dimensions in the given vec3 not using vectorization
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the matrix to scale
 * @param {ReadonlyVec3} v the vec3 to scale the matrix by
 * @returns {mat4} out
 **/
function scale(out: mat4, a: mat4, v: vec3) {
  const x = v[0];
  const y = v[1];
  const z = v[2];
  out[0] = a[0] * x;
  out[1] = a[1] * x;
  out[2] = a[2] * x;
  out[3] = a[3] * x;
  out[4] = a[4] * y;
  out[5] = a[5] * y;
  out[6] = a[6] * y;
  out[7] = a[7] * y;
  out[8] = a[8] * z;
  out[9] = a[9] * z;
  out[10] = a[10] * z;
  out[11] = a[11] * z;
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
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
export function multiplyMat4Mat4(out: mat4, a: mat4, b: mat4) {
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

export function getExtraModelMatrix(dx: number, dy: number, graphic: IGraphic): mat4 | null {
  const { alpha, beta } = graphic.attribute;
  if (!alpha && !beta) {
    return null;
  }
  const { anchor3d = graphic.attribute.anchor } = graphic.attribute;

  const _anchor: [number, number] = [0, 0];
  if (anchor3d) {
    if (typeof anchor3d[0] === 'string') {
      const ratio = parseFloat(anchor3d[0]) / 100;
      const bounds = graphic.AABBBounds;
      _anchor[0] = bounds.x1 + (bounds.x2 - bounds.x1) * ratio;
    } else {
      _anchor[0] = anchor3d[0];
    }
    if (typeof anchor3d[1] === 'string') {
      const ratio = parseFloat(anchor3d[1]) / 100;
      const bounds = graphic.AABBBounds;
      _anchor[1] = bounds.x1 + (bounds.x2 - bounds.x1) * ratio;
    } else {
      _anchor[1] = anchor3d[1];
    }
  }

  if (graphic.type === 'text') {
    const { textAlign } = graphic.attribute as ITextGraphicAttribute;
    // 计算偏移
    _anchor[0] += textDrawOffsetX(textAlign, (graphic as IText).clipedWidth);
  }

  // 应用偏移，计算全局的偏移
  _anchor[0] += dx;
  _anchor[1] += dy;
  // matrix.scale(dpr, dpr);

  const modelMatrix = mat4Allocate.allocate();
  translate(modelMatrix, modelMatrix, [_anchor[0], _anchor[1], 0]);
  if (beta) {
    rotateX(modelMatrix, modelMatrix, beta);
  }
  if (alpha) {
    rotateY(modelMatrix, modelMatrix, alpha);
  }
  translate(modelMatrix, modelMatrix, [-_anchor[0], -_anchor[1], 0]);

  return modelMatrix;
}

// 计算3d下的模型矩阵
export function getModelMatrix(out: mat4, graphic: IGraphic, theme: ITransform) {
  const {
    x = theme.x,
    y = theme.y,
    z = theme.z,
    dx = theme.dx,
    dy = theme.dy,
    dz = theme.dz,
    scaleX = theme.scaleX,
    scaleY = theme.scaleY,
    scaleZ = theme.scaleZ,
    alpha = theme.alpha,
    beta = theme.beta,
    angle = theme.angle,
    anchor3d = graphic.attribute.anchor,
    anchor
  } = graphic.attribute;

  const _anchor: [number, number, number] = [0, 0, 0];
  if (anchor3d) {
    if (typeof anchor3d[0] === 'string') {
      const ratio = parseFloat(anchor3d[0]) / 100;
      const bounds = graphic.AABBBounds;
      _anchor[0] = bounds.x1 + (bounds.x2 - bounds.x1) * ratio;
    } else {
      _anchor[0] = anchor3d[0];
    }
    if (typeof anchor3d[1] === 'string') {
      const ratio = parseFloat(anchor3d[1]) / 100;
      const bounds = graphic.AABBBounds;
      _anchor[1] = bounds.x1 + (bounds.x2 - bounds.x1) * ratio;
    } else {
      _anchor[1] = anchor3d[1];
    }
    _anchor[2] = anchor3d[2] ?? 0;
  }

  // if (graphic.type === 'text') {
  //   const { textAlign } = graphic.attribute as ITextGraphicAttribute;
  //   // 计算偏移
  //   _anchor[0] += textDrawOffsetX(textAlign, (graphic as IText).clipedWidth);
  // }

  identity(out);
  // 平移
  translate(out, out, [x + dx, y + dy, z + dz]);
  translate(out, out, [_anchor[0], _anchor[1], _anchor[2]]);
  rotateX(out, out, beta);
  rotateY(out, out, alpha);
  // 基于z轴的偏移基于anchor计算
  // rotateZ(out, out, angle);
  translate(out, out, [-_anchor[0], -_anchor[1], _anchor[2]]);
  scale(out, out, [scaleX, scaleY, scaleZ]);

  // 计算基于z轴的偏移
  if (angle) {
    const m = mat4Allocate.allocate();
    const _anchor: [number, number] = [0, 0];
    if (anchor) {
      if (typeof anchor3d[0] === 'string') {
        const ratio = parseFloat(anchor3d[0]) / 100;
        const bounds = graphic.AABBBounds;
        _anchor[0] = bounds.x1 + (bounds.x2 - bounds.x1) * ratio;
      } else {
        _anchor[0] = anchor3d[0];
      }
      if (typeof anchor3d[1] === 'string') {
        const ratio = parseFloat(anchor3d[1]) / 100;
        const bounds = graphic.AABBBounds;
        _anchor[1] = bounds.x1 + (bounds.x2 - bounds.x1) * ratio;
      } else {
        _anchor[1] = anchor3d[1];
      }
    }

    translate(m, m, [_anchor[0], _anchor[1], 0]);
    // 基于z轴的偏移基于anchor计算
    rotateZ(m, m, angle);
    translate(m, m, [-_anchor[0], -_anchor[1], 0]);

    multiplyMat4Mat4(out, out, m);
  }
}

export function shouldUseMat4(graphic: IGraphic) {
  const { alpha, beta } = graphic.attribute;
  return alpha || beta;
}

// 管理graphic
@injectable()
export class DefaultGraphicService implements IGraphicService {
  declare hooks: {
    onAttributeUpdate: ISyncHook<[IGraphic]>;
    onSetStage: ISyncHook<[IGraphic, IStage]>;
    onRemove: ISyncHook<[IGraphic]>;
    onRelease: ISyncHook<[IGraphic]>;
    onAddIncremental: ISyncHook<[IGraphic, IGroup, IStage]>;
    onClearIncremental: ISyncHook<[IGroup, IStage]>;
    beforeUpdateAABBBounds: ISyncHook<[IGraphic, IStage, boolean, IAABBBounds]>;
    afterUpdateAABBBounds: ISyncHook<[IGraphic, IStage, IAABBBounds, { globalAABBBounds: IAABBBounds }, boolean]>;
  };

  protected _rectBoundsContribitions: IRectBoundsContribution[];
  protected _symbolBoundsContribitions: ISymbolBoundsContribution[];
  protected _circleBoundsContribitions: ICircleBoundsContribution[];
  protected _arcBoundsContribitions: IArcBoundsContribution[];
  protected _pathBoundsContribitions: IPathBoundsContribution[];
  // 临时bounds，用作缓存
  protected tempAABBBounds1: AABBBounds;
  protected tempAABBBounds2: AABBBounds;
  constructor(
    @inject(GraphicCreator) public readonly creator: IGraphicCreator,
    @inject(ContributionProvider)
    @named(RectBoundsContribution)
    protected readonly rectBoundsContribitions: IContributionProvider<IRectBoundsContribution>,
    @inject(ContributionProvider)
    @named(SymbolBoundsContribution)
    protected readonly symbolBoundsContribitions: IContributionProvider<ISymbolBoundsContribution>,
    @inject(ContributionProvider)
    @named(CircleBoundsContribution)
    protected readonly circleBoundsContribitions: IContributionProvider<ICircleBoundsContribution>,
    @inject(ContributionProvider)
    @named(ArcBoundsContribution)
    protected readonly arcBoundsContribitions: IContributionProvider<IArcBoundsContribution>,
    @inject(ContributionProvider)
    @named(PathBoundsContribution)
    protected readonly pathBoundsContribitions: IContributionProvider<IPathBoundsContribution>
  ) {
    this.hooks = {
      onAttributeUpdate: new SyncHook<[IGraphic]>(['graphic']),
      onSetStage: new SyncHook<[IGraphic, IStage]>(['graphic', 'stage']),
      onRemove: new SyncHook<[IGraphic]>(['graphic']),
      onRelease: new SyncHook<[IGraphic]>(['graphic']),
      onAddIncremental: new SyncHook<[IGraphic, IGroup, IStage]>(['graphic', 'group', 'stage']),
      onClearIncremental: new SyncHook<[IGroup, IStage]>(['graphic', 'group', 'stage']),
      beforeUpdateAABBBounds: new SyncHook<[IGraphic, IStage, boolean, IAABBBounds]>([
        'graphic',
        'stage',
        'willUpdate',
        'aabbBounds'
      ]),
      afterUpdateAABBBounds: new SyncHook<[IGraphic, IStage, IAABBBounds, { globalAABBBounds: IAABBBounds }, boolean]>([
        'graphic',
        'stage',
        'aabbBounds',
        'globalAABBBounds',
        'selfChange'
      ])
    };
    this.tempAABBBounds1 = new AABBBounds();
    this.tempAABBBounds2 = new AABBBounds();
  }
  onAttributeUpdate(graphic: IGraphic) {
    if (this.hooks.onAttributeUpdate.taps.length) {
      this.hooks.onAttributeUpdate.call(graphic);
    }
  }
  onSetStage(graphic: IGraphic, stage: IStage): void {
    if (this.hooks.onSetStage.taps.length) {
      this.hooks.onSetStage.call(graphic, stage);
    }
  }
  onRemove(graphic: IGraphic<Partial<IGraphicAttribute>>): void {
    if (this.hooks.onRemove.taps.length) {
      this.hooks.onRemove.call(graphic);
    }
  }
  onRelease(graphic: IGraphic<Partial<IGraphicAttribute>>): void {
    if (this.hooks.onRelease.taps.length) {
      this.hooks.onRelease.call(graphic);
    }
  }
  onAddIncremental(graphic: IGraphic, group: IGroup, stage: IStage): void {
    if (this.hooks.onAddIncremental.taps.length) {
      this.hooks.onAddIncremental.call(graphic, group, stage);
    }
  }
  onClearIncremental(group: IGroup, stage: IStage): void {
    if (this.hooks.onClearIncremental.taps.length) {
      this.hooks.onClearIncremental.call(group, stage);
    }
  }
  beforeUpdateAABBBounds(graphic: IGraphic, stage: IStage, willUpdate: boolean, bounds: IAABBBounds) {
    if (this.hooks.beforeUpdateAABBBounds.taps.length) {
      this.hooks.beforeUpdateAABBBounds.call(graphic, stage, willUpdate, bounds);
    }
  }
  afterUpdateAABBBounds(
    graphic: IGraphic,
    stage: IStage,
    bounds: IAABBBounds,
    params: { globalAABBBounds: IAABBBounds },
    selfChange: boolean
  ) {
    if (this.hooks.afterUpdateAABBBounds.taps.length) {
      this.hooks.afterUpdateAABBBounds.call(graphic, stage, bounds, params, selfChange);
    }
  }

  updatePathProxyAABBBounds(aabbBounds: IAABBBounds, graphic?: IGraphic): boolean {
    const path = typeof graphic.pathProxy === 'function' ? graphic.pathProxy(graphic.attribute) : graphic.pathProxy;
    if (!path) {
      return false;
    }
    const boundsContext = new BoundsContext(aabbBounds);
    renderCommandList(path.commandList, boundsContext, 0, 0);
    return true;
  }

  updateRectAABBBounds(
    attribute: IRectGraphicAttribute,
    rectTheme: Required<IRectGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IGraphic
  ) {
    if (!this.updatePathProxyAABBBounds(aabbBounds, graphic)) {
      const { width = rectTheme.width, height = rectTheme.height } = attribute;
      aabbBounds.set(0, 0, width, height);
    }

    const tb1 = this.tempAABBBounds1;
    const tb2 = this.tempAABBBounds2;
    tb1.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);
    tb2.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);
    if (!this._rectBoundsContribitions) {
      this._rectBoundsContribitions = this.rectBoundsContribitions.getContributions() || [];
    }
    this._rectBoundsContribitions.length &&
      this._rectBoundsContribitions.forEach(c => {
        c.updateBounds(attribute, rectTheme, tb1, graphic);
        aabbBounds.union(tb1);
        tb1.setValue(tb2.x1, tb2.y1, tb2.x2, tb2.y2);
      });

    this.transformAABBBounds(attribute, aabbBounds, rectTheme, false, graphic);
    return aabbBounds;
  }

  updateGroupAABBBounds(
    attribute: IGroupGraphicAttribute,
    groupTheme: Required<IGroupGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IGroup
  ) {
    const { width, height, path, clip = groupTheme.clip } = attribute;
    // 添加自身的fill或者clip
    if (path && path.length) {
      path.forEach(g => {
        aabbBounds.union(g.AABBBounds);
      });
    } else if (width != null && height != null) {
      aabbBounds.set(0, 0, width, height);
    }
    if (!clip) {
      // 添加子节点
      graphic.forEachChildren((node: IGraphic) => {
        aabbBounds.union(node.AABBBounds);
      });
    }

    const tb1 = this.tempAABBBounds1;
    const tb2 = this.tempAABBBounds2;
    tb1.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);
    tb2.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);
    this.transformAABBBounds(attribute, aabbBounds, groupTheme, false, graphic);
    return aabbBounds;
  }

  updateGlyphAABBBounds(
    attribute: IGlyphGraphicAttribute,
    theme: Required<IGlyphGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IGlyph
  ) {
    // 添加子节点
    graphic.getSubGraphic().forEach((node: IGraphic) => {
      aabbBounds.union(node.AABBBounds);
    });

    // glyph不需要计算AABBBounds
    // this.transformAABBBounds(attribute, aabbBounds, theme, graphic);
    return aabbBounds;
  }

  updateRichTextAABBBounds(
    attribute: IRichTextGraphicAttribute,
    richtextTheme: Required<IRichTextGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IRichText
  ) {
    if (!graphic) {
      return aabbBounds;
    }

    const {
      width = richtextTheme.width,
      height = richtextTheme.height,
      maxWidth = richtextTheme.maxWidth,
      maxHeight = richtextTheme.maxHeight,
      textAlign = richtextTheme.textAlign,
      textBaseline = richtextTheme.textBaseline
    } = attribute;

    if (width > 0 && height > 0) {
      // 外部设置宽高
      aabbBounds.set(0, 0, width, height);
    } else {
      // 获取内容宽高
      const frameCache = graphic.getFrameCache();
      const { width: actualWidth, height: actualHeight } = frameCache.getActualSize();
      let contentWidth = width || actualWidth || 0;
      let contentHeight = height || actualHeight || 0;

      contentHeight = typeof maxHeight === 'number' && contentHeight > maxHeight ? maxHeight : contentHeight || 0;
      contentWidth = typeof maxWidth === 'number' && contentWidth > maxWidth ? maxWidth : contentWidth || 0;

      aabbBounds.set(0, 0, contentWidth, contentHeight);
    }

    // 调整对齐方式
    let deltaY = 0;
    switch (textBaseline) {
      case 'top':
        deltaY = 0;
        break;
      case 'middle':
        deltaY = -aabbBounds.height() / 2;
        break;
      case 'bottom':
        deltaY = -aabbBounds.height();
        break;
      default:
        break;
    }
    let deltaX = 0;
    switch (textAlign) {
      case 'left':
        deltaX = 0;
        break;
      case 'center':
        deltaX = -aabbBounds.width() / 2;
        break;
      case 'right':
        deltaX = -aabbBounds.width();
        break;
      default:
        break;
    }
    aabbBounds.translate(deltaX, deltaY);

    const tb1 = this.tempAABBBounds1;
    const tb2 = this.tempAABBBounds2;
    tb1.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);
    tb2.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);

    this.transformAABBBounds(attribute, aabbBounds, richtextTheme, false, graphic);
    return aabbBounds;
  }

  updateTextAABBBounds(
    attribute: ITextGraphicAttribute,
    textTheme: Required<ITextGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IText
  ) {
    if (!graphic) {
      return aabbBounds;
    }
    const { text = textTheme.text } = graphic.attribute;
    if (Array.isArray(text)) {
      graphic.updateMultilineAABBBounds(text as (number | string)[]);
    } else {
      graphic.updateSingallineAABBBounds(text as number | string);
    }

    const tb1 = this.tempAABBBounds1;
    const tb2 = this.tempAABBBounds2;
    tb1.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);
    tb2.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);

    const {
      scaleX = textTheme.scaleX,
      scaleY = textTheme.scaleY,
      shadowBlur = textTheme.shadowBlur,
      strokeBoundsBuffer = textTheme.strokeBoundsBuffer
    } = attribute;
    if (shadowBlur) {
      const shadowBlurHalfWidth = shadowBlur / Math.abs(scaleX + scaleY);
      boundStroke(tb1, shadowBlurHalfWidth, true, strokeBoundsBuffer);
      aabbBounds.union(tb1);
    }
    // 合并shadowRoot的bounds
    this.combindShadowAABBBounds(aabbBounds, graphic);

    transformBoundsWithMatrix(aabbBounds, aabbBounds, graphic.transMatrix);
    return aabbBounds;
  }

  updatePathAABBBounds(
    attribute: IPathGraphicAttribute,
    pathTheme: Required<IPathGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IPath
  ) {
    if (!this.updatePathProxyAABBBounds(aabbBounds, graphic)) {
      this.updatePathAABBBoundsImprecise(attribute, pathTheme, aabbBounds, graphic);
    }

    const tb1 = this.tempAABBBounds1;
    const tb2 = this.tempAABBBounds2;
    tb1.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);
    tb2.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);
    if (!this._pathBoundsContribitions) {
      this._pathBoundsContribitions = this.pathBoundsContribitions.getContributions() || [];
    }
    this._pathBoundsContribitions.length &&
      this._pathBoundsContribitions.forEach(c => {
        c.updateBounds(attribute, pathTheme, tb1, graphic);
        aabbBounds.union(tb1);
        tb1.setValue(tb2.x1, tb2.y1, tb2.x2, tb2.y2);
      });
    const { lineJoin = pathTheme.lineJoin } = attribute;
    this.transformAABBBounds(attribute, aabbBounds, pathTheme, lineJoin === 'miter', graphic);
    return aabbBounds;
  }

  protected updatePathAABBBoundsImprecise(
    attribute: IPathGraphicAttribute,
    pathTheme: Required<IPathGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IPath
  ): IAABBBounds {
    if (!graphic) {
      return aabbBounds;
    }
    const pathShape = graphic.getParsedPathShape();
    aabbBounds.union(pathShape.getBounds());

    return aabbBounds;
  }

  updatePyramid3dAABBBounds(
    attribute: IPyramid3dGraphicAttribute,
    polygonTheme: Required<IPyramid3dGraphicAttribute>,
    aabbBounds: IBounds,
    graphic?: IPyramid3d
  ) {
    if (!graphic) {
      return aabbBounds;
    }

    const stage = graphic.stage;
    if (!stage || !stage.camera) {
      return aabbBounds;
    }

    const faces = graphic.findFace();
    // const outP = [0, 0, 0];
    faces.vertices.forEach(v => {
      const x = v[0];
      const y = v[1];
      aabbBounds.add(x, y);
    });

    const tb1 = this.tempAABBBounds1;
    const tb2 = this.tempAABBBounds2;
    tb1.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);
    tb2.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);

    this.transformAABBBounds(attribute, aabbBounds, polygonTheme, false, graphic);
    return aabbBounds;
  }

  updateArc3dAABBBounds(
    attribute: IArc3dGraphicAttribute,
    arcTheme: Required<IArc3dGraphicAttribute>,
    aabbBounds: IBounds,
    graphic?: IArc3d
  ) {
    if (!graphic) {
      return aabbBounds;
    }

    const stage = graphic.stage;
    if (!stage || !stage.camera) {
      return aabbBounds;
    }

    // 当做一个立方体计算
    const { outerRadius = arcTheme.outerRadius, height = 0 } = attribute;
    const r = outerRadius + height;
    aabbBounds.setValue(-r, -r, r, r);
    // const matrix = getExtraModelMatrix(graphic.globalTransMatrix, 1, graphic);
    // const { outerRadius=arcTheme.outerRadius, height=0 } = attribute;
    // const points = [
    //   {x: -outerRadius, y: -outerRadius, z: 0 },
    //   {x: outerRadius, y: -outerRadius, z: 0 },
    //   {x: outerRadius, y: outerRadius, z: 0 },
    //   {x: -outerRadius, y: outerRadius, z: 0 },
    //   {x: -outerRadius, y: -outerRadius, z: height },
    //   {x: outerRadius, y: -outerRadius, z: height },
    //   {x: outerRadius, y: outerRadius, z: height },
    //   {x: -outerRadius, y: outerRadius, z: height },
    // ]
    // const outP: vec3 = [0, 0, 0];
    // points.forEach(item => {
    //   let x = item.x;
    //   let y = item.y;
    //   if (stage.camera) {
    //     transformMat4(outP, [item.x, item.y, item.z], matrix);
    //     const data = stage.camera.vp(outP[0], outP[1], outP[2]);
    //     x = data.x;
    //     y = data.y;
    //   }
    //   aabbBounds.add(x, y);
    // });

    const tb1 = this.tempAABBBounds1;
    const tb2 = this.tempAABBBounds2;
    tb1.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);
    tb2.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);

    this.transformAABBBounds(attribute, aabbBounds, arcTheme, false, graphic);
    return aabbBounds;
  }

  updatePolygonAABBBounds(
    attribute: IPolygonGraphicAttribute,
    polygonTheme: Required<IPolygonGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IPolygon
  ) {
    if (!this.updatePathProxyAABBBounds(aabbBounds, graphic)) {
      this.updatePolygonAABBBoundsImprecise(attribute, polygonTheme, aabbBounds, graphic);
    }

    const tb1 = this.tempAABBBounds1;
    const tb2 = this.tempAABBBounds2;
    tb1.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);
    tb2.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);
    // if (!this._pathBoundsContribitions) {
    //   this._pathBoundsContribitions = this.pathBoundsContribitions.getContributions() || [];
    // }
    // this._pathBoundsContribitions.length &&
    //   this._pathBoundsContribitions.forEach(c => {
    //     c.updateBounds(attribute, polygonTheme, tb1, graphic);
    //     aabbBounds.union(tb1);
    //     tb1.setValue(tb2.x1, tb2.y1, tb2.x2, tb2.y2);
    //   });

    const { lineJoin = polygonTheme.lineJoin } = attribute;
    this.transformAABBBounds(attribute, aabbBounds, polygonTheme, lineJoin === 'miter', graphic);
    return aabbBounds;
  }

  protected updatePolygonAABBBoundsImprecise(
    attribute: IPolygonGraphicAttribute,
    polygonTheme: Required<IPolygonGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IPolygon
  ): IAABBBounds {
    const { points = polygonTheme.points } = attribute;
    points.forEach(p => {
      aabbBounds.add(p.x, p.y);
    });

    return aabbBounds;
  }

  updateLineAABBBounds(
    attribute: ILineGraphicAttribute,
    lineTheme: Required<ILineGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: ILine
  ) {
    if (!this.updatePathProxyAABBBounds(aabbBounds, graphic)) {
      attribute.segments
        ? this.updateLineAABBBoundsBySegments(attribute, lineTheme, aabbBounds, graphic)
        : this.updateLineAABBBoundsByPoints(attribute, lineTheme, aabbBounds, graphic);
    }

    const tb1 = this.tempAABBBounds1;
    const tb2 = this.tempAABBBounds2;
    tb1.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);
    tb2.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);
    // if (!this._rectBoundsContribitions) {
    //   this._rectBoundsContribitions = this.rectBoundsContribitions.getContributions() || [];
    // }
    // this._rectBoundsContribitions.length &&
    //   this._rectBoundsContribitions.forEach(c => {
    //     c.updateBounds(attribute, areaTheme, tb1, graphic);
    //     aabbBounds.union(tb1);
    //     tb1.setValue(tb2.x1, tb2.y1, tb2.x2, tb2.y2);
    //   });

    const { lineJoin = lineTheme.lineJoin } = attribute;
    this.transformAABBBounds(attribute, aabbBounds, lineTheme, lineJoin === 'miter', graphic);
    return aabbBounds;
  }

  protected updateLineAABBBoundsByPoints(
    attribute: ILineGraphicAttribute,
    lineTheme: Required<ILineGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: ILine
  ): IAABBBounds {
    const { points = lineTheme.points } = attribute;
    const b = aabbBounds;
    points.forEach(p => {
      b.add(p.x, p.y);
    });
    return b;
  }
  protected updateLineAABBBoundsBySegments(
    attribute: ILineGraphicAttribute,
    lineTheme: Required<ILineGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: ILine
  ): IAABBBounds {
    const { segments = lineTheme.segments } = attribute;
    const b = aabbBounds;
    segments.forEach(s => {
      s.points.forEach(p => {
        b.add(p.x, p.y);
      });
    });
    return b;
  }

  updateAreaAABBBounds(
    attribute: IAreaGraphicAttribute,
    areaTheme: Required<IAreaGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IArea
  ) {
    if (!this.updatePathProxyAABBBounds(aabbBounds, graphic)) {
      attribute.segments
        ? this.updateAreaAABBBoundsBySegments(attribute, areaTheme, aabbBounds, graphic)
        : this.updateAreaAABBBoundsByPoints(attribute, areaTheme, aabbBounds, graphic);
    }

    const tb1 = this.tempAABBBounds1;
    const tb2 = this.tempAABBBounds2;
    tb1.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);
    tb2.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);
    // if (!this._rectBoundsContribitions) {
    //   this._rectBoundsContribitions = this.rectBoundsContribitions.getContributions() || [];
    // }
    // this._rectBoundsContribitions.length &&
    //   this._rectBoundsContribitions.forEach(c => {
    //     c.updateBounds(attribute, areaTheme, tb1, graphic);
    //     aabbBounds.union(tb1);
    //     tb1.setValue(tb2.x1, tb2.y1, tb2.x2, tb2.y2);
    //   });

    const { lineJoin = areaTheme.lineJoin } = attribute;
    this.transformAABBBounds(attribute, aabbBounds, areaTheme, lineJoin === 'miter', graphic);
    return aabbBounds;
  }

  protected updateAreaAABBBoundsByPoints(
    attribute: IAreaGraphicAttribute,
    areaTheme: Required<IAreaGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IArea
  ): IAABBBounds {
    const { points = areaTheme.points } = attribute;
    const b = aabbBounds;
    points.forEach(p => {
      b.add(p.x, p.y);
      b.add(p.x1 ?? p.x, p.y1 ?? p.y); //面积图特殊性：由三个值构成，横向面积图，x1会省略；纵向面积图，y1会省略
    });
    return b;
  }
  protected updateAreaAABBBoundsBySegments(
    attribute: IAreaGraphicAttribute,
    areaTheme: Required<IAreaGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IArea
  ): IAABBBounds {
    const { segments = areaTheme.segments } = attribute;
    const b = aabbBounds;
    segments.forEach(s => {
      s.points.forEach(p => {
        b.add(p.x, p.y);
        b.add(p.x1 ?? p.x, p.y1 ?? p.y); //面积图特殊性：由三个值构成，横向面积图，x1会省略；纵向面积图，y1会省略
      });
    });
    return b;
  }

  updateCircleAABBBounds(
    attribute: ICircleGraphicAttribute,
    circleTheme: Required<ICircleGraphicAttribute>,
    aabbBounds: IAABBBounds,
    full?: boolean,
    graphic?: ICircle
  ) {
    if (!this.updatePathProxyAABBBounds(aabbBounds, graphic)) {
      full
        ? this.updateCircleAABBBoundsImprecise(attribute, circleTheme, aabbBounds, graphic)
        : this.updateCircleAABBBoundsAccurate(attribute, circleTheme, aabbBounds, graphic);
    }

    const tb1 = this.tempAABBBounds1;
    const tb2 = this.tempAABBBounds2;
    tb1.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);
    tb2.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);
    // 额外扩展bounds
    if (!this._circleBoundsContribitions) {
      this._circleBoundsContribitions = this.circleBoundsContribitions.getContributions() || [];
    }
    this._circleBoundsContribitions.length &&
      this._circleBoundsContribitions.forEach(c => {
        c.updateBounds(attribute, circleTheme, tb1, graphic);
        aabbBounds.union(tb1);
        tb1.setValue(tb2.x1, tb2.y1, tb2.x2, tb2.y2);
      });

    this.transformAABBBounds(attribute, aabbBounds, circleTheme, false, graphic);

    return aabbBounds;
  }

  protected updateCircleAABBBoundsImprecise(
    attribute: ICircleGraphicAttribute,
    circleTheme: Required<ICircleGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IGraphic
  ): IAABBBounds {
    const { radius = circleTheme.radius } = attribute;
    aabbBounds.set(-radius, -radius, radius, radius);

    return aabbBounds;
  }
  protected updateCircleAABBBoundsAccurate(
    attribute: ICircleGraphicAttribute,
    circleTheme: Required<ICircleGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IGraphic
  ): IAABBBounds {
    const {
      startAngle = circleTheme.startAngle,
      endAngle = circleTheme.endAngle,
      radius = circleTheme.radius
    } = attribute;

    if (endAngle - startAngle > pi2 - epsilon) {
      aabbBounds.set(-radius, -radius, radius, radius);
    } else {
      circleBounds(startAngle, endAngle, radius, aabbBounds);
    }

    return aabbBounds;
  }

  updateArcAABBBounds(
    attribute: IArcGraphicAttribute,
    arcTheme: Required<IArcGraphicAttribute>,
    aabbBounds: IAABBBounds,
    full?: boolean,
    graphic?: IArc
  ) {
    if (!this.updatePathProxyAABBBounds(aabbBounds, graphic)) {
      full
        ? this.updateArcAABBBoundsImprecise(attribute, arcTheme, aabbBounds, graphic)
        : this.updateArcAABBBoundsAccurate(attribute, arcTheme, aabbBounds, graphic);
    }

    const tb1 = this.tempAABBBounds1;
    const tb2 = this.tempAABBBounds2;
    tb1.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);
    tb2.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);
    // 额外扩展bounds
    if (!this._arcBoundsContribitions) {
      this._arcBoundsContribitions = this.arcBoundsContribitions.getContributions() || [];
    }
    this._arcBoundsContribitions.length &&
      this._arcBoundsContribitions.forEach(c => {
        c.updateBounds(attribute, arcTheme, tb1, graphic);
        aabbBounds.union(tb1);
        tb1.setValue(tb2.x1, tb2.y1, tb2.x2, tb2.y2);
      });

    const { lineJoin = arcTheme.lineJoin } = attribute;
    this.transformAABBBounds(attribute, aabbBounds, arcTheme, lineJoin === 'miter', graphic);

    return aabbBounds;
  }

  protected updateArcAABBBoundsImprecise(
    attribute: IArcGraphicAttribute,
    arcTheme: Required<IArcGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IGraphic
  ): IAABBBounds {
    const { outerRadius = arcTheme.outerRadius } = attribute;

    aabbBounds.set(-outerRadius, -outerRadius, outerRadius, outerRadius);

    return aabbBounds;
  }
  protected updateArcAABBBoundsAccurate(
    attribute: IArcGraphicAttribute,
    arcTheme: Required<IArcGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IGraphic
  ): IAABBBounds {
    let { outerRadius = arcTheme.outerRadius, innerRadius = arcTheme.innerRadius } = attribute;
    if (outerRadius < innerRadius) {
      // 不用解构，避免性能问题
      const temp = outerRadius;
      outerRadius = innerRadius;
      innerRadius = temp;
    }
    let { endAngle = arcTheme.endAngle, startAngle = arcTheme.startAngle } = attribute;

    if (startAngle > endAngle) {
      const temp = startAngle;
      startAngle = endAngle;
      endAngle = temp;
    }

    if (outerRadius <= epsilon) {
      aabbBounds.set(0, 0, 0, 0);
    } else if (Math.abs(endAngle - startAngle) > pi2 - epsilon) {
      aabbBounds.set(-outerRadius, -outerRadius, outerRadius, outerRadius);
    } else {
      // 直接内外两个radius叠加即可，不需要更精确
      circleBounds(startAngle, endAngle, outerRadius, aabbBounds);
      circleBounds(startAngle, endAngle, innerRadius, aabbBounds);
    }

    return aabbBounds;
  }

  updateSymbolAABBBounds(
    attribute: ISymbolGraphicAttribute,
    symbolTheme: Required<ISymbolGraphicAttribute>,
    aabbBounds: IAABBBounds,
    full?: boolean,
    graphic?: ISymbol
  ) {
    if (!this.updatePathProxyAABBBounds(aabbBounds, graphic)) {
      full
        ? this.updateSymbolAABBBoundsImprecise(attribute, symbolTheme, aabbBounds, graphic)
        : this.updateSymbolAABBBoundsAccurate(attribute, symbolTheme, aabbBounds, graphic);
    }

    const tb1 = this.tempAABBBounds1;
    const tb2 = this.tempAABBBounds2;
    tb1.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);
    tb2.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);
    // 额外扩展bounds
    if (!this._symbolBoundsContribitions) {
      this._symbolBoundsContribitions = this.symbolBoundsContribitions.getContributions() || [];
    }
    this._symbolBoundsContribitions.length &&
      this._symbolBoundsContribitions.forEach(c => {
        c.updateBounds(attribute, symbolTheme, tb1, graphic);
        aabbBounds.union(tb1);
        tb1.setValue(tb2.x1, tb2.y1, tb2.x2, tb2.y2);
      });

    const { lineJoin = symbolTheme.lineJoin } = attribute;
    this.transformAABBBounds(attribute, aabbBounds, symbolTheme, lineJoin === 'miter', graphic);
    return aabbBounds;
  }

  updateSymbolAABBBoundsImprecise(
    attribute: ISymbolGraphicAttribute,
    symbolTheme: Required<ISymbolGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IGraphic
  ): IAABBBounds {
    // 当做正方形计算
    const { size = symbolTheme.size } = attribute;

    if (isArray(size)) {
      aabbBounds.set(-size[0] / 2, -size[1] / 2, size[0] / 2, size[1] / 2);
    } else {
      const halfWH = size / 2;

      aabbBounds.set(-halfWH, -halfWH, halfWH, halfWH);
    }

    return aabbBounds;
  }

  updateSymbolAABBBoundsAccurate(
    attribute: ISymbolGraphicAttribute,
    symbolTheme: Required<ISymbolGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: ISymbol
  ): IAABBBounds {
    if (!graphic) {
      return aabbBounds;
    }
    const { size = symbolTheme.size } = attribute;

    const symbolClass = graphic.getParsedPath();
    symbolClass.bounds(size, aabbBounds);

    return aabbBounds;
  }

  updateImageAABBBounds(
    attribute: IImageGraphicAttribute,
    imageTheme: Required<IImageGraphicAttribute>,
    aabbBounds: IAABBBounds,
    graphic?: IGraphic
  ) {
    if (!this.updatePathProxyAABBBounds(aabbBounds, graphic)) {
      const { width = imageTheme.width, height = imageTheme.height } = attribute;
      aabbBounds.set(0, 0, width, height);
    }

    const tb1 = this.tempAABBBounds1;
    const tb2 = this.tempAABBBounds2;
    tb1.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);
    tb2.setValue(aabbBounds.x1, aabbBounds.y1, aabbBounds.x2, aabbBounds.y2);

    this.transformAABBBounds(attribute, aabbBounds, imageTheme, false, graphic);
    return aabbBounds;
  }

  combindShadowAABBBounds(bounds: IAABBBounds, graphic?: IGraphic) {
    // 合并shadowRoot的Bounds
    if (graphic && graphic.shadowRoot) {
      const b = graphic.shadowRoot.AABBBounds;
      bounds.union(b);
    }
  }

  transformAABBBounds(
    attribute: Partial<IGraphicAttribute>,
    aabbBounds: IAABBBounds,
    theme: Required<IGraphicAttribute>,
    miter: boolean,
    graphic?: IGraphic
  ) {
    const {
      scaleX = theme.scaleX,
      scaleY = theme.scaleY,
      stroke = theme.stroke,
      shadowBlur = theme.shadowBlur,
      lineWidth = theme.lineWidth,
      strokeBoundsBuffer = theme.strokeBoundsBuffer
    } = attribute;
    const tb1 = this.tempAABBBounds1;
    const tb2 = this.tempAABBBounds2;
    if (stroke && lineWidth) {
      const scaledHalfLineWidth = lineWidth / Math.abs(scaleX + scaleY);
      boundStroke(tb1, scaledHalfLineWidth, miter, strokeBoundsBuffer);
      aabbBounds.union(tb1);
      tb1.setValue(tb2.x1, tb2.y1, tb2.x2, tb2.y2);
    }
    if (shadowBlur) {
      const shadowBlurHalfWidth = shadowBlur / Math.abs(scaleX + scaleY);
      boundStroke(tb1, shadowBlurHalfWidth, miter, strokeBoundsBuffer);
      aabbBounds.union(tb1);
      // tb1.setValue(tb2.x1, tb2.y1, tb2.x2, tb2.y2);
    }

    // 合并shadowRoot的bounds
    this.combindShadowAABBBounds(aabbBounds, graphic);

    // 性能优化逻辑，group类型变换较少，不需要矩阵变换
    let updateMatrix = true;
    const m = graphic.transMatrix;
    if (graphic && graphic.isContainer) {
      updateMatrix = !(m.a === 1 && m.b === 0 && m.c === 0 && m.d === 1 && m.e === 0 && m.f === 0);
    }
    updateMatrix && transformBoundsWithMatrix(aabbBounds, aabbBounds, m);

    // TODO 加上锚点
    // transformBounds(aabbBounds, x, y, scaleX, scaleY, angle);
    // if (graphic.attribute.postMatrix) {
    //   console.log('aaa');
    //   transformBoundsWithMatrix(aabbBounds, graphic.attribute.postMatrix);
    // }
    // aabbBounds.translate(dx, dy);
  }
}
