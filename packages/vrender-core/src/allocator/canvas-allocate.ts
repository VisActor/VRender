import type { ICanvas, Releaseable, IAllocate, IGlobal } from '../interface';
import { wrapCanvas } from '../canvas/util';
import { serviceRegistry } from '../common/registry/service-registry';
import { VGlobal } from '../constants';

export class DefaultCanvasAllocate implements IAllocate<ICanvas>, Releaseable {
  protected pools: ICanvas[] = [];
  protected _commonCanvas: any;
  // 已经被分配出去的canvas
  protected allocatedCanvas: ICanvas[] = [];
  shareCanvas(): ICanvas {
    if (this.allocatedCanvas.length) {
      return this.allocatedCanvas[0];
    }
    return this.getCommonCanvas();
  }
  getCommonCanvas(): ICanvas {
    if (!this._commonCanvas) {
      this._commonCanvas = this.allocate({ width: 100, height: 100, dpr: 2 });
    }
    return this._commonCanvas;
  }
  allocate(data: { width: number; height: number; dpr: number }): ICanvas {
    if (!this.pools.length) {
      const global = serviceRegistry.get(VGlobal) as IGlobal;
      const nativeCanvas = global.createCanvas(data);
      const c = wrapCanvas({ nativeCanvas, ...data });
      this.allocatedCanvas.push(c);
      return c;
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
      const global = serviceRegistry.get(VGlobal) as IGlobal;
      const nativeCanvas = global.createCanvas(data);
      const c = wrapCanvas({ nativeCanvas, ...data });
      this.allocatedCanvas.push(c);
      return c;
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
