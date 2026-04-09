import { BasePlugin } from './base-plugin';
import type { IBrowserEnvPluginHooks, IPluginContext } from './types';

export class BrowserEnvPlugin extends BasePlugin {
  constructor(name: string, private readonly hooks: IBrowserEnvPluginHooks = {}, version?: string) {
    super(name, version);
  }

  install(context: IPluginContext): void {
    this.hooks.install?.(context);
  }

  uninstall(): void {
    this.hooks.uninstall?.();
  }
}
