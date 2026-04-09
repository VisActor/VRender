import { BasePlugin } from './base-plugin';
import type { IPickerPluginEntries, IPluginContext } from './types';

export class PickerPlugin extends BasePlugin {
  constructor(name: string, private readonly entries: IPickerPluginEntries, version?: string) {
    super(name, version);
  }

  install(context: IPluginContext): void {
    context.registry.picker.registerMany(this.entries);
  }
}
