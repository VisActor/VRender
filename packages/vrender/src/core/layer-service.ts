import { inject, injectable } from 'inversify';
import { ILayer, IStage, Global, IGlobal } from '../interface';
import { Layer } from './layer';

export const LayerService = Symbol.for('LayerService');

@injectable()
export class DefaultLayerService implements ILayerService {
  declare layerMap: Map<IStage, ILayer[]>;
  constructor(@inject(Global) public readonly global: IGlobal) {
    this.layerMap = new Map();
  }

  getStageLayer(stage: IStage) {
    return this.layerMap.get(stage);
  }

  createLayer(stage: IStage): ILayer {
    const layer = new Layer(stage, this.global, stage.window, { main: false });
    const stageLayers = this.layerMap.get(stage) || [];
    stageLayers.push(layer);
    this.layerMap.set(stage, stageLayers);
    return layer;
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

export interface ILayerService {
  createLayer: (stage: IStage) => ILayer;
  releaseLayer: (stage: IStage, layer: ILayer) => void;
  restLayerCount: (stage: IStage) => number;
  getStageLayer: (stage: IStage) => ILayer[];
  layerCount: (stage: IStage) => number;
}
