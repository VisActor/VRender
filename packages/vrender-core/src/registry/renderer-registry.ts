import type { IGraphicRender } from '../interface/render';
import type { IRendererRegistry, IRendererRegistryEntry, RegistryKey } from './types';

function isRendererFactory(entry: IRendererRegistryEntry): entry is () => IGraphicRender {
  return typeof entry === 'function';
}

export class RendererRegistry implements IRendererRegistry {
  private readonly entries = new Map<RegistryKey, IRendererRegistryEntry>();
  private readonly cache = new Map<RegistryKey, IGraphicRender>();

  register(key: RegistryKey, renderer: IRendererRegistryEntry): void {
    this.entries.set(key, renderer);
    this.cache.delete(key);
  }

  registerMany(entries: Iterable<[RegistryKey, IRendererRegistryEntry]>): void {
    for (const [key, renderer] of entries) {
      this.register(key, renderer);
    }
  }

  get(key: RegistryKey): IGraphicRender | undefined {
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    const entry = this.entries.get(key);
    if (!entry) {
      return undefined;
    }

    const renderer = isRendererFactory(entry) ? entry() : entry;
    this.cache.set(key, renderer);
    return renderer;
  }

  getAll(): IGraphicRender[] {
    return Array.from(this.entries.keys())
      .map(key => this.get(key))
      .filter((renderer): renderer is IGraphicRender => !!renderer);
  }

  clear(): void {
    this.entries.clear();
    this.cache.clear();
  }
}
