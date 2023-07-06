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
  IWindow,
  ILayerHandlerInitParams,
  ILayerHandlerDrawParams,
  IDrawContext
} from '../../../interface';
import type { IBounds } from '@visactor/vutils';
import { Global } from '../../../constants';

@injectable()
export class CanvasLayerHandlerContribution implements ILayerHandlerContribution {
  layer: ILayer;
  canvas: ICanvas;
  context: IContext2d;
  offscreen: boolean;

  constructor(@inject(Global) public readonly global: IGlobal) {
    this.offscreen = false;
  }

  init(layer: ILayer, window: IWindow, params: ILayerHandlerInitParams): void {
    this.layer = layer;
    // 默认图层，那么直接拿window上的上下文和canvas即可
    if (params.main) {
      this.context = window.getContext();
      this.canvas = this.context.getCanvas();
    } else {
      let nativeCanvas: HTMLElement;
      if (params.canvasId) {
        nativeCanvas = this.global.getElementById(params.canvasId);
      } else {
        nativeCanvas = this.global.createCanvas({
          width: window.width,
          height: window.height
        });
      }
      const windowContext = window.getContext();
      const windowCanvas = windowContext.getCanvas().nativeCanvas;
      const canvas = wrapCanvas({
        nativeCanvas,
        width: window.width,
        height: window.height,
        dpr: window.dpr,
        canvasControled: true,
        container: window.getContainer(),
        x: windowCanvas.offsetLeft,
        y: windowCanvas.offsetTop
      });
      canvas.applyPosition();
      this.canvas = canvas;
      this.context = canvas.getContext();
    }
  }

  resize(w: number, h: number) {
    this.canvas.resize(w, h);
    return;
  }
  resizeView(w: number, h: number) {
    return;
  }

  render(group: IGroup[], params: ILayerHandlerDrawParams, userParams?: Partial<IDrawContext>): void {
    params.renderService.render(group, {
      context: this.context,
      clear: params.background ?? '#ffffff',
      ...params,
      ...userParams
    });
  }

  merge(layerHandlers: ILayerHandlerContribution[]) {
    layerHandlers.forEach(l => {
      const ctx = l.getContext();
      const canvas = ctx.canvas.nativeCanvas;
      this.context.drawImage(canvas, 0, 0);
    });
  }

  prepare(dirtyBounds: IBounds, params: ILayerHandlerDrawParams) {
    return;
  }

  drawTo(target: IWindow, group: IGroup[], params: IDrawToParams & ILayerHandlerDrawParams) {
    const context = target.getContext();
    params.renderService.render(group, {
      context,
      ...params,
      clear: params.clear ? params.background ?? '#fff' : undefined
    });
    return;
  }

  getContext(): IContext2d {
    return this.context;
  }

  release() {
    this.canvas.release();
  }
}
