import type { IGraphicFactory, ILayerFactory, IStageFactory } from '../factory';
import type { IContributionRegistry, IPickerRegistry, IPluginRegistry, IRendererRegistry } from '../registry';

export interface IPlugin {
  readonly name: string;
  readonly version: string;
  install: (context: IPluginContext) => void;
  uninstall?: () => void;
}

export interface IPluginContext {
  registry: {
    renderer: IRendererRegistry;
    picker: IPickerRegistry;
    contribution: IContributionRegistry;
    plugin: IPluginRegistry;
  };
  factory: {
    stage: IStageFactory;
    layer: ILayerFactory;
    graphic: IGraphicFactory;
  };
}
