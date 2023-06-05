import { injectable } from 'inversify';
import { IMatrix, IMatrixLike, Matrix } from '@visactor/vutils';
import { IAllocate } from './interface';
import { mat4, Releaseable } from '../interface';

export const MatrixAllocate = Symbol.for('MatrixAllocate');
export const Mat4Allocate = Symbol.for('Mat4Allocate');

export type IMatrixAllocate = IAllocate<IMatrix>;
export type IMat4Allocate = IAllocate<mat4>;

export function createMat4(): mat4 {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}

@injectable()
export class DefaultMatrixAllocate implements IAllocate<IMatrix>, Releaseable {
  protected pools: IMatrix[] = [];
  allocate(a: number, b: number, c: number, d: number, e: number, f: number): IMatrix {
    if (!this.pools.length) {
      return new Matrix(a, b, c, d, e, f);
    }
    const m = this.pools.pop() as any;
    m.a = a;
    m.b = b;
    m.c = c;
    m.d = d;
    m.e = e;
    m.f = f;
    return m;
  }
  allocateByObj(matrix: IMatrixLike): IMatrix {
    if (!this.pools.length) {
      return new Matrix(matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f);
    }
    const m = this.pools.pop() as any;
    m.a = matrix.a;
    m.b = matrix.b;
    m.c = matrix.c;
    m.d = matrix.d;
    m.e = matrix.e;
    m.f = matrix.f;
    return m;
  }
  free(d: Matrix) {
    this.pools.push(d);
  }
  get length(): number {
    return this.pools.length;
  }
  release(...params: any): void {
    this.pools = [];
  }
}

@injectable()
export class DefaultMat4Allocate implements IAllocate<mat4>, Releaseable {
  protected pools: mat4[] = [];

  static identity(out: mat4) {
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

  allocate(): mat4 {
    if (!this.pools.length) {
      return createMat4();
    }
    const m = this.pools.pop() as mat4;
    DefaultMat4Allocate.identity(m);
    return m;
  }
  allocateByObj(d: mat4): mat4 {
    let m: mat4;
    if (!this.pools.length) {
      m = createMat4();
    } else {
      m = this.pools.pop() as mat4;
    }
    for (let i = 0; i < m.length; i++) {
      m[i] = d[i];
    }
    return m;
  }
  free(m: mat4) {
    m && this.pools.push(m);
  }
  get length(): number {
    return this.pools.length;
  }
  release(...params: any): void {
    this.pools = [];
  }
}
