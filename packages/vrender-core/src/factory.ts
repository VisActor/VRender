import { getFactoryState } from './factory-state';

export class Factory {
  private static _pluginClasses = getFactoryState().pluginClasses;

  static registerPlugin(pluginKey: string, pluginClass: any) {
    Factory._pluginClasses[pluginKey] = pluginClass;
  }

  static getPlugin(pluginKey: string) {
    return Factory._pluginClasses[pluginKey];
  }
}

export { FACTORY_STATE_SYMBOL, getFactoryState } from './factory-state';
export type { IFactoryState } from './factory-state';
export * from './factory/index';
