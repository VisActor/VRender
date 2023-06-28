import { inject, injectable } from 'inversify';
import { wrapCanvas } from '../../../canvas/util';
import type {
  IGlobal,
  ICanvas,
  IContext2d,
  IDrawToParams,
  IGroup,
  ILayer,
  ILayerHandlerContribution,
  ILayerHandlerInitParams,
  IWindow,
  ILayerHandlerDrawParams
} from '../../../interface';
import type { IBoundsLike } from '@visactor/vutils';
import { Global } from '../../../constants';

@injectable()
export class OffscreenLayerHandlerContribution implements ILayerHandlerContribution {
  layer: ILayer;
  canvas: ICanvas;
  context: IContext2d;
  offscreen: boolean;

  constructor(@inject(Global) public readonly global: IGlobal) {
    this.offscreen = true;
  }

  init(layer: ILayer, window: IWindow, params: ILayerHandlerInitParams): void {
    this.layer = layer;
    const nativeCanvas = this.global.createOffscreenCanvas({
      width: params.width,
      height: params.height,
      dpr: window.dpr
    });
    const canvas = wrapCanvas({
      nativeCanvas,
      width: params.width,
      height: params.height,
      dpr: window.dpr,
      canvasControled: true
    });

    this.canvas = canvas;
    this.context = canvas.getContext();
  }

  resize(w: number, h: number) {
    this.canvas.resize(w, h);
    return;
  }
  resizeView(w: number, h: number) {
    this.canvas.resize(w, h);
    return;
  }

  render(group: IGroup[], params: ILayerHandlerDrawParams): void {
    params.renderService.render(group, {
      context: this.context,
      ...params,
      x: 0,
      y: 0,
      clear: params.background ?? '#ffffff'
    });
  }

  prepare(dirtyBounds: IBoundsLike, params: ILayerHandlerDrawParams) {
    return;
  }

  release() {
    this.canvas.release();
  }

  getContext(): IContext2d {
    return this.context;
  }

  drawTo(target: IWindow, group: IGroup[], params: IDrawToParams & ILayerHandlerDrawParams) {
    const context = target.getContext();
    const targetDpr = target.dpr;

    const { x = 0, y = 0, width = this.layer.viewWidth, height = this.layer.viewHeight } = params;
    // 这个context可能是外部的，不要使用内置的状态，直接用原生的context
    context.nativeContext.save();
    context.nativeContext.setTransform(targetDpr, 0, 0, targetDpr, 0, 0);
    if (params.clear) {
      context.clearRect(x, y, width, height);
    }
    context.drawImage(this.canvas.nativeCanvas, 0, 0, this.canvas.width, this.canvas.height, x, y, width, height);
    context.nativeContext.restore();
  }

  merge(layerHandlers: ILayerHandlerContribution[]) {
    return;
  }
}
