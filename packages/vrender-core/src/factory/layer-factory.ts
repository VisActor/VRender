import type { ILayer } from '../interface';
import { Layer } from '../core/layer';
import type { ILayerConstructor, ILayerFactory, ILayerFactoryCreateParams } from './types';

export class LayerFactory<TLayer extends ILayer = ILayer> implements ILayerFactory<TLayer> {
  constructor(private readonly LayerCtor: ILayerConstructor<TLayer> = Layer as unknown as ILayerConstructor<TLayer>) {}

  create({ stage, global, window, params }: ILayerFactoryCreateParams) {
    return new this.LayerCtor(stage, global, window, params);
  }
}
