import type { IGraphicPicker } from '../interface/picker';
import type { IGraphicFactory, ILayerFactory, IStageFactory } from '../factory';
import type {
  IContributionRegistry,
  IPickerRegistry,
  IPluginRegistry,
  IRendererRegistry,
  IRendererRegistryEntry,
  RegistryKey
} from '../registry';

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

export interface IBrowserEnvPluginHooks {
  install?: (context: IPluginContext) => void;
  uninstall?: () => void;
}

export type IRendererPluginEntries = Iterable<[RegistryKey, IRendererRegistryEntry]>;
export type IPickerPluginEntries = Iterable<[RegistryKey, IGraphicPicker]>;
