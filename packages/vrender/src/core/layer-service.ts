import { inject, injectable } from 'inversify';
import type { ILayer, IStage, IGlobal, ILayerParams } from '../interface';
import { Layer } from './layer';
import type { ILayerService } from '../interface/core';
import { Global } from '../constants';

@injectable()
export class DefaultLayerService implements ILayerService {
  declare layerMap: Map<IStage, ILayer[]>;
  declare staticLayerCountInEnv: number;
  declare dynamicLayerCountInEnv: number;
  declare inited: boolean;
  constructor(@inject(Global) public readonly global: IGlobal) {
    this.layerMap = new Map();
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

  createLayer(stage: IStage, options: ILayerParams = { main: false }): ILayer {
    this.tryInit();
    const layer = new Layer(stage, this.global, stage.window, {
      ...options,
      virtual: this.staticLayerCountInEnv === 0
    });
    const stageLayers = this.layerMap.get(stage) || [];
    stageLayers.push(layer);
    this.layerMap.set(stage, stageLayers);
    this.staticLayerCountInEnv--;
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
