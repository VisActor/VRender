import type { IGraphicPicker } from '../interface/picker';
import type { IGraphicRender } from '../interface/render';
import type { IPlugin } from '../plugins/types';

export type RegistryKey = string | symbol | number;

export type IRendererFactory = () => IGraphicRender;
export type IRendererRegistryEntry = IGraphicRender | IRendererFactory;

export interface IRendererRegistry {
  register: (key: RegistryKey, renderer: IRendererRegistryEntry) => void;
  registerMany: (entries: Iterable<[RegistryKey, IRendererRegistryEntry]>) => void;
  get: (key: RegistryKey) => IGraphicRender | undefined;
  getAll: () => IGraphicRender[];
  clear: () => void;
}

export interface IPickerRegistry {
  register: (key: RegistryKey, picker: IGraphicPicker) => void;
  registerMany: (entries: Iterable<[RegistryKey, IGraphicPicker]>) => void;
  get: (key: RegistryKey) => IGraphicPicker | undefined;
  getAll: () => IGraphicPicker[];
  clear: () => void;
}

export interface IPluginRegistry {
  install: (plugin: IPlugin) => void;
  uninstall: (name: string) => void;
  get: (name: string) => IPlugin | undefined;
  getAll: () => IPlugin[];
  clear: () => void;
}

export interface IContributionRegistry<T = unknown> {
  register: (key: RegistryKey, contribution: T) => void;
  registerMany: (entries: Iterable<[RegistryKey, T]>) => void;
  get: (key: RegistryKey) => T[];
  getAll: () => T[];
  clear: (key?: RegistryKey) => void;
}
