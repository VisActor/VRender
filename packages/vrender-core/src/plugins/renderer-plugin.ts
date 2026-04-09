import { BasePlugin } from './base-plugin';
import type { IPluginContext, IRendererPluginEntries } from './types';

export class RendererPlugin extends BasePlugin {
  constructor(name: string, private readonly entries: IRendererPluginEntries, version?: string) {
    super(name, version);
  }

  install(context: IPluginContext): void {
    context.registry.renderer.registerMany(this.entries);
  }
}
