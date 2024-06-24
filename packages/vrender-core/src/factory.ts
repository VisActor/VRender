export class Factory {
  private static _pluginClasses: Record<string, any> = {};

  static registerPlugin(pluginKey: string, pluginClass: any) {
    Factory._pluginClasses[pluginKey] = pluginClass;
  }

  static getPlugin(pluginKey: string) {
    return Factory._pluginClasses[pluginKey];
  }
}
