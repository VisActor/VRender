import { inject, injectable } from '../../../common/inversify-lite';
import type {
  IGlobal,
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
export class EmptyLayerHandlerContribution implements ILayerHandlerContribution {
  declare layer: ILayer;
  declare canvas: null;
  declare context: null;
  declare offscreen: boolean;
  declare main: boolean;
  declare window: IWindow;
  declare type: LayerMode;
  // 所依赖的主layer handler
  declare mainHandler: ILayerHandlerContribution;
  declare global: IGlobal;

  constructor() {
    this.offscreen = false;
    this.type = 'virtual';
    this.global = application.global;
  }

  setDpr(dpr: number) {
    return;
  }

  init(layer: ILayer, window: IWindow, params: ILayerHandlerInitParams): void {
    this.layer = layer;
    this.window = window;
    if (params.main) {
      throw new Error('virtual layer不能作为main layer');
    }
    this.main = false;
    this.canvas = null;
    this.context = null;
  }

  resize(w: number, h: number) {
    return;
  }
  resizeView(w: number, h: number) {
    return;
  }

  render(group: IGroup[], params: ILayerHandlerDrawParams, userParams?: Partial<IDrawContext>): void {
    this.mainHandler.render(group, params, { ...userParams, clear: false });
    return;
  }

  merge(layerHandlers: ILayerHandlerContribution[]) {
    return;
  }

  prepare(dirtyBounds: IBounds, params: ILayerHandlerDrawParams) {
    return;
  }

  drawTo(target: IWindow, group: IGroup[], params: IDrawToParams & ILayerHandlerDrawParams) {
    const context = target.getContext();
    params.renderService.render(group, {
      context,
      viewBox: params.stage.window.getViewBox(),
      transMatrix: params.stage.window.getViewBoxTransform(),
      ...params,
      clear: params.clear ? params.background ?? '#fff' : undefined
    });
    return;
  }

  getContext(): null {
    return null;
  }

  release() {
    return;
  }
}
