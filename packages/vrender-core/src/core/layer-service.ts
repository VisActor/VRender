import type { ILayer, IStage, IGlobal, ILayerParams, LayerMode, ILayerHandlerContribution } from '../interface';
import type { ILayerService } from '../interface/core';
import { LayerFactory, type ILayerFactory } from '../factory';
import { application } from '../application';

type ILayerHandlerFactory = (layerMode: LayerMode) => ILayerHandlerContribution;

function defaultLayerHandlerFactory(layerMode: LayerMode): ILayerHandlerContribution {
  const handlerFactory = application.layerHandlerFactory;
  if (!handlerFactory) {
    throw new Error('Layer handler factory is not configured.');
  }
  return handlerFactory(layerMode);
}

export class DefaultLayerService implements ILayerService {
  declare layerMap: Map<IStage, ILayer[]>;
  declare staticLayerCountInEnv: number;
  declare dynamicLayerCountInEnv: number;
  declare inited: boolean;
  readonly global: IGlobal;
  static idprefix: string = 'visactor_layer';
  static prefix_count: number = 0;

  static GenerateLayerId() {
    return `${DefaultLayerService.idprefix}_${DefaultLayerService.prefix_count++}`;
  }

  constructor(
    global: IGlobal = application.global,
    private readonly layerFactory: ILayerFactory = new LayerFactory(),
    private readonly layerHandlerFactory: ILayerHandlerFactory = defaultLayerHandlerFactory
  ) {
    this.layerMap = new Map();
    this.global = global;
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
    return this.layerHandlerFactory(layerMode);
  }

  createLayer(stage: IStage, options: Partial<ILayerParams> = { main: false }): ILayer {
    this.tryInit();
    let layerMode = this.getRecommendedLayerType(options.layerMode);
    layerMode = options.main ? 'static' : options.canvasId ? 'static' : layerMode;
    const layerHandler = this.getLayerHandler(layerMode);
    const layer = this.layerFactory.create({
      stage,
      global: this.global,
      window: stage.window,
      params: {
        main: false,
        ...options,
        layerMode,
        canvasId: options.canvasId ?? DefaultLayerService.GenerateLayerId(),
        layerHandler
      }
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

  releaseStage(stage: IStage) {
    this.layerMap.delete(stage);
  }
}
