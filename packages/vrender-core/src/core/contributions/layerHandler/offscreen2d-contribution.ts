import { inject, injectable } from '../../../common/inversify-lite';
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
  ILayerHandlerDrawParams,
  LayerMode
} from '../../../interface';
import type { IBoundsLike } from '@visactor/vutils';
import { application } from '../../../application';

@injectable()
export class OffscreenLayerHandlerContribution implements ILayerHandlerContribution {
  declare layer: ILayer;
  declare canvas: ICanvas;
  declare context: IContext2d;
  declare offscreen: boolean;
  declare type: LayerMode;
  // 所绑定的副layer handler
  declare secondaryHandlers: ILayerHandlerContribution[];
  declare global: IGlobal;

  constructor() {
    this.offscreen = true;
    this.type = 'dynamic';
    this.global = application.global;
  }

  setDpr(dpr: number) {
    this.canvas.dpr = dpr;
    return;
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
      viewBox: params.stage.window.getViewBox(),
      transMatrix: params.stage.window.getViewBoxTransform(),
      ...params,
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

    const { viewBox } = params;
    const x = viewBox.x1;
    const y = viewBox.y1;
    const width = viewBox.width();
    const height = viewBox.height();
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
