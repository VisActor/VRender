import type { IStage, IStageParams } from '../interface';
import type { IPlugin, IPluginContext } from '../plugins';

export type IAppContextRegistryName = keyof IPluginContext['registry'];
export type IAppContextFactoryName = keyof IPluginContext['factory'];

export interface IAppContext extends IPluginContext {
  readonly released: boolean;
  getRegistry: <TKey extends IAppContextRegistryName>(name: TKey) => IPluginContext['registry'][TKey];
  getFactory: <TKey extends IAppContextFactoryName>(name: TKey) => IPluginContext['factory'][TKey];
  installPlugin: (plugin: IPlugin) => void;
  installPlugins: (plugins: IPlugin[]) => void;
  uninstallPlugin: (name: string) => void;
  createStage: (params?: Partial<IStageParams>) => IStage;
  release: () => void;
}

export interface IApp {
  readonly context: IAppContext;
  readonly registry: IAppContext['registry'];
  readonly factory: IAppContext['factory'];
  readonly released: boolean;
  installPlugin: (plugin: IPlugin) => void;
  installPlugins: (plugins: IPlugin[]) => void;
  uninstallPlugin: (name: string) => void;
  createStage: (params?: Partial<IStageParams>) => IStage;
  release: () => void;
}

export type IEntry = IApp;

export interface IEntryOptions {
  context?: Partial<IPluginContext>;
}
