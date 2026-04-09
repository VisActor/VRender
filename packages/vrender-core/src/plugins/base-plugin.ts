import type { IPlugin, IPluginContext } from './types';

export abstract class BasePlugin implements IPlugin {
  constructor(public readonly name: string, public readonly version: string = '1.0.0') {}

  abstract install(context: IPluginContext): void;

  uninstall(): void {
    return;
  }
}
