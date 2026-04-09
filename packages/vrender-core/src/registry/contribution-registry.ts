import type { IContributionRegistry, RegistryKey } from './types';

export class ContributionRegistry<T = unknown> implements IContributionRegistry<T> {
  private readonly entries = new Map<RegistryKey, T[]>();

  register(key: RegistryKey, contribution: T): void {
    const current = this.entries.get(key) ?? [];
    current.push(contribution);
    this.entries.set(key, current);
  }

  registerMany(entries: Iterable<[RegistryKey, T]>): void {
    for (const [key, contribution] of entries) {
      this.register(key, contribution);
    }
  }

  get(key: RegistryKey): T[] {
    return [...(this.entries.get(key) ?? [])];
  }

  getAll(): T[] {
    return Array.from(this.entries.values()).reduce<T[]>((all, current) => {
      all.push(...current);
      return all;
    }, []);
  }

  clear(key?: RegistryKey): void {
    if (key == null) {
      this.entries.clear();
      return;
    }
    this.entries.delete(key);
  }
}
