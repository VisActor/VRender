import type { IPlugin } from '../plugins/types';
import type { IPluginRegistry } from './types';

export class PluginRegistry implements IPluginRegistry {
  private readonly entries = new Map<string, IPlugin>();

  install(plugin: IPlugin): void {
    this.entries.set(plugin.name, plugin);
  }

  uninstall(name: string): void {
    this.entries.delete(name);
  }

  get(name: string): IPlugin | undefined {
    return this.entries.get(name);
  }

  getAll(): IPlugin[] {
    return Array.from(this.entries.values());
  }

  clear(): void {
    this.entries.clear();
  }
}
