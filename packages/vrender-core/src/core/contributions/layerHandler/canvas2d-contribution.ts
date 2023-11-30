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
  IWindow,
  ILayerHandlerInitParams,
  ILayerHandlerDrawParams,
  IDrawContext,
  LayerMode
} from '../../../interface';
import type { IBounds } from '@visactor/vutils';
import { application } from '../../../application';

@injectable()
export class CanvasLayerHandlerContribution implements ILayerHandlerContribution {
  layer: ILayer;
  canvas: ICanvas;
  context: IContext2d;
  offscreen: boolean;
  main: boolean;
  window: IWindow;
  type: LayerMode = 'static';
  global: IGlobal;
  // 所绑定的副layer handler
  secondaryHandlers: ILayerHandlerContribution[];

  constructor() {
    this.offscreen = false;
    this.global = application.global;
  }

  setDpr(dpr: number) {
    this.canvas.dpr = dpr;
    return;
  }

  init(layer: ILayer, window: IWindow, params: ILayerHandlerInitParams): void {
    this.layer = layer;
    this.window = window;
    // 默认图层，那么直接拿window上的上下文和canvas即可
    if (params.main) {
      this.main = true;
      this.context = window.getContext();
      this.canvas = this.context.getCanvas();
    } else {
      this.main = false;
      let nativeCanvas: HTMLElement;
      if (params.canvasId) {
        nativeCanvas = this.global.getElementById(params.canvasId);
      } else {
        nativeCanvas = this.global.createCanvas({
          width: window.width,
          height: window.height
        });
      }
      // 不是main的话，就穿透点击事件
      if (nativeCanvas.style) {
        nativeCanvas.style['pointer-events'] = 'none';
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
    // 调整位置
    if (!this.main) {
      const windowContext = this.window.getContext();
      const windowCanvas = windowContext.getCanvas().nativeCanvas;
      if (windowCanvas && (this.canvas.x !== windowCanvas.offsetLeft || this.canvas.y !== windowCanvas.offsetTop)) {
        this.canvas.x = windowCanvas.offsetLeft;
        this.canvas.y = windowCanvas.offsetTop;
        this.canvas.applyPosition();
      }
    }
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
