import { inject, injectable } from 'inversify';
import { IAllocate } from './interface';
import { Global, ICanvas, IGlobal, Releaseable } from '../interface';
import { wrapCanvas } from '../canvas';

export const CanvasAllocate = Symbol.for('CanvasAllocate');

export type ICanvasAllocate = IAllocate<ICanvas>;

@injectable()
export class DefaultCanvasAllocate implements IAllocate<ICanvas>, Releaseable {
  constructor(@inject(Global) public readonly global: IGlobal) {}
  protected pools: ICanvas[] = [];
  allocate(data: { width: number; height: number; dpr: number }): ICanvas {
    if (!this.pools.length) {
      return wrapCanvas({
        nativeCanvas: this.global.createCanvas(data),
        ...data
      });
    }
    const m = this.pools.pop();
    m.resize(data.width, data.height);
    m.dpr = data.dpr;
    return m;
  }
  allocateByObj(canvas: ICanvas): ICanvas {
    if (!this.pools.length) {
      const data = {
        width: canvas.width / canvas.dpr,
        height: canvas.height / canvas.dpr,
        dpr: canvas.dpr
      };
      return wrapCanvas({
        nativeCanvas: this.global.createCanvas(data),
        ...data
      });
    }
    const m = this.pools.pop();
    m.width = canvas.width;
    m.height = canvas.height;
    return m;
  }
  free(d: ICanvas) {
    this.pools.push(d);
  }
  get length(): number {
    return this.pools.length;
  }
  release(...params: any): void {
    this.pools = [];
  }
}
