import type { interfaces } from '../common/inversify-lite';
import type { IContributionProvider } from '../interface';

export const ContributionProvider = Symbol('ContributionProvider');

class ContributionProviderCache<T> implements IContributionProvider<T> {
  protected caches?: T[];
  protected serviceIdentifier: interfaces.ServiceIdentifier<T>;
  protected container: interfaces.Container;

  constructor(serviceIdentifier: interfaces.ServiceIdentifier<T>, container: interfaces.Container) {
    this.serviceIdentifier = serviceIdentifier;
    this.container = container;
    ContributionStore.setStore(this.serviceIdentifier, this);
  }

  getContributions(): T[] {
    if (!this.caches) {
      this.caches = [];
      this.container &&
        this.container.isBound(this.serviceIdentifier) &&
        this.caches.push(...this.container.getAll(this.serviceIdentifier));
    }
    return this.caches;
  }

  refresh() {
    if (!this.caches) {
      return;
    }
    this.caches.length = 0;
    this.container &&
      this.container.isBound(this.serviceIdentifier) &&
      this.caches.push(...this.container.getAll(this.serviceIdentifier));
  }
}

export function bindContributionProvider(bind: interfaces.Bind, id: any): void {
  bind(ContributionProvider)
    .toDynamicValue(({ container }) => new ContributionProviderCache(id, container))
    .inSingletonScope()
    .whenTargetNamed(id);
}

export function bindContributionProviderNoSingletonScope(bind: interfaces.Bind, id: any): void {
  bind(ContributionProvider)
    .toDynamicValue(({ container }) => new ContributionProviderCache(id, container))
    .whenTargetNamed(id);
}

export class ContributionStore {
  static store: Map<interfaces.ServiceIdentifier<any>, ContributionProviderCache<any>> = new Map();

  static getStore(id: interfaces.ServiceIdentifier<any>): ContributionProviderCache<any> {
    return this.store.get(id);
  }

  static setStore(id: interfaces.ServiceIdentifier<any>, cache: ContributionProviderCache<any>): void {
    this.store.set(id, cache);
  }

  static refreshAllContributions(): void {
    this.store.forEach(cache => {
      cache.refresh();
    });
  }
}
