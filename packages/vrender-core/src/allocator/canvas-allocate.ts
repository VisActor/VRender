import { application } from '../application';
import type { ICanvas, Releaseable, IAllocate } from '../interface';
import { wrapCanvas } from '../canvas/util';

export class DefaultCanvasAllocate implements IAllocate<ICanvas>, Releaseable {
  protected pools: ICanvas[] = [];
  allocate(data: { width: number; height: number; dpr: number }): ICanvas {
    if (!this.pools.length) {
      return wrapCanvas({
        nativeCanvas: application.global.createCanvas(data),
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
        nativeCanvas: application.global.createCanvas(data),
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

export const canvasAllocate = new DefaultCanvasAllocate();
