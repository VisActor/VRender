import type { IPlugin } from '../plugins';
import { AppContext } from './app-context';
import type { IEntry, IEntryOptions } from './types';

export class BrowserEntry implements IEntry {
  readonly context: AppContext;

  constructor(options: IEntryOptions = {}) {
    this.context = new AppContext(options.context);
  }

  get registry() {
    return this.context.registry;
  }

  get factory() {
    return this.context.factory;
  }

  get released() {
    return this.context.released;
  }

  installPlugin(plugin: IPlugin): void {
    this.context.installPlugin(plugin);
  }

  installPlugins(plugins: IPlugin[]): void {
    this.context.installPlugins(plugins);
  }

  uninstallPlugin(name: string): void {
    this.context.uninstallPlugin(name);
  }

  createStage(params = {}) {
    return this.context.createStage(params);
  }

  release(): void {
    this.context.release();
  }
}

export function createBrowserApp(options: IEntryOptions = {}) {
  return new BrowserEntry(options);
}
