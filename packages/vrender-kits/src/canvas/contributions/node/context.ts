// 参考konva
import { Matrix } from '@visactor/vutils';
import { injectable } from '@visactor/vrender-core';
import type { IContext2d, EnvType, ICanvas } from '@visactor/vrender-core';
import { BrowserContext2d } from '../browser';

@injectable()
export class NodeContext2d extends BrowserContext2d implements IContext2d {
  static env: EnvType = 'node';

  constructor(canvas: ICanvas, dpr: number) {
    super(canvas, dpr);
    const context = canvas.nativeCanvas.getContext('2d');
    if (!context) {
      throw new Error('发生错误，获取2d上下文失败');
    }
    this.nativeContext = context;
    this.canvas = canvas;
    this.matrix = new Matrix(1, 0, 0, 1, 0, 0);
    this.stack = [];
    this.dpr = dpr ?? 1;
  }

  release(...params: any): void {
    return;
  }
}
