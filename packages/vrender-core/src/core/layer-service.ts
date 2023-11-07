import { inject, injectable } from '../common/inversify-lite';
import type { ILayer, IStage, IGlobal, ILayerParams, LayerMode, ILayerHandlerContribution } from '../interface';
import { Layer } from './layer';
import type { ILayerService } from '../interface/core';
import { container } from '../container';
import {
  DynamicLayerHandlerContribution,
  StaticLayerHandlerContribution,
  VirtualLayerHandlerContribution
} from './constants';
import { application } from '../application';

@injectable()
export class DefaultLayerService implements ILayerService {
  declare layerMap: Map<IStage, ILayer[]>;
  declare staticLayerCountInEnv: number;
  declare dynamicLayerCountInEnv: number;
  declare inited: boolean;
  declare global: IGlobal;
  constructor() {
    this.layerMap = new Map();
    this.global = application.global;
  }

  tryInit() {
    if (!this.inited) {
      this.staticLayerCountInEnv = this.global.getStaticCanvasCount();
      this.dynamicLayerCountInEnv = this.global.getDynamicCanvasCount();
      this.inited = true;
    }
  }

  getStageLayer(stage: IStage) {
    return this.layerMap.get(stage);
  }

  getRecommendedLayerType(layerMode?: LayerMode): LayerMode {
    if (layerMode) {
      return layerMode;
    }
    // 默认推荐实体canvas，不行就推荐离屏canvas，最次才是virtual
    if (this.staticLayerCountInEnv !== 0) {
      return 'static';
    } else if (this.dynamicLayerCountInEnv !== 0) {
      return 'dynamic';
    }
    return 'virtual';
  }

  getLayerHandler(layerMode: LayerMode) {
    let layerHandler: ILayerHandlerContribution;
    if (layerMode === 'static') {
      layerHandler = container.get<ILayerHandlerContribution>(StaticLayerHandlerContribution);
    } else if (layerMode === 'dynamic') {
      layerHandler = container.get<ILayerHandlerContribution>(DynamicLayerHandlerContribution);
    } else {
      layerHandler = container.get<ILayerHandlerContribution>(VirtualLayerHandlerContribution);
    }
    return layerHandler;
  }

  createLayer(stage: IStage, options: Partial<ILayerParams> = { main: false }): ILayer {
    this.tryInit();
    let layerMode = this.getRecommendedLayerType(options.layerMode);
    layerMode = options.canvasId ? 'static' : layerMode;
    const layerHandler = this.getLayerHandler(layerMode);
    const layer = new Layer(stage, this.global, stage.window, {
      main: false,
      ...options,
      layerMode,
      canvasId: options.canvasId,
      layerHandler
    });
    const stageLayers = this.layerMap.get(stage) || [];
    stageLayers.push(layer);
    this.layerMap.set(stage, stageLayers);
    this.staticLayerCountInEnv--;
    return layer;
  }

  prepareStageLayer(stage: IStage) {
    let mainHandler: ILayerHandlerContribution;
    stage.forEachChildren((l: ILayer) => {
      const handler = l.getNativeHandler();
      if (handler.type === 'virtual') {
        handler.mainHandler = mainHandler;
        mainHandler.secondaryHandlers.push(handler);
      } else {
        mainHandler = handler;
        mainHandler.secondaryHandlers = [];
      }
    });
  }

  releaseLayer(stage: IStage, layer: ILayer): void {
    layer.release();
    const stageLayers = this.layerMap.get(stage) || [];
    this.layerMap.set(
      stage,
      stageLayers.filter(l => l !== layer)
    );
  }

  layerCount(stage: IStage): number {
    return (this.layerMap.get(stage) || []).length;
  }
  restLayerCount(stage: IStage): number {
    // TODO: 设置精确的值
    if (this.global.env === 'browser') {
      return 10;
    }
    return 0;
  }
}
