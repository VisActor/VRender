import type { IBindingResolver, ServiceIdentifier } from './explicit-binding';
import type { IContributionProvider } from '../interface';

export const ContributionProvider = Symbol('ContributionProvider');

class ContributionProviderCache<T> implements IContributionProvider<T> {
  protected caches?: T[];
  protected serviceIdentifier: ServiceIdentifier<T>;
  protected container: IBindingResolver & { isBound: (serviceIdentifier: ServiceIdentifier<T>) => boolean };

  constructor(
    serviceIdentifier: ServiceIdentifier<T>,
    container: IBindingResolver & { isBound: (serviceIdentifier: ServiceIdentifier<T>) => boolean }
  ) {
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

type IContributionProviderFactoryContext = {
  container: IBindingResolver & { isBound: (serviceIdentifier: ServiceIdentifier) => boolean };
};

export function createContributionProvider<T>(
  serviceIdentifier: ServiceIdentifier<T>,
  container: IBindingResolver & { isBound: (serviceIdentifier: ServiceIdentifier<T>) => boolean }
): IContributionProvider<T> {
  return new ContributionProviderCache(serviceIdentifier, container);
}

export function bindContributionProvider(bind: any, id: ServiceIdentifier): void {
  bind(ContributionProvider)
    .toDynamicValue(({ container }: IContributionProviderFactoryContext) => createContributionProvider(id, container))
    .inSingletonScope()
    .whenTargetNamed(id);
}

export function bindContributionProviderNoSingletonScope(bind: any, id: ServiceIdentifier): void {
  bind(ContributionProvider)
    .toDynamicValue(({ container }: IContributionProviderFactoryContext) => createContributionProvider(id, container))
    .whenTargetNamed(id);
}

export class ContributionStore {
  static store: Map<ServiceIdentifier<any>, ContributionProviderCache<any>> = new Map();

  static getStore(id: ServiceIdentifier<any>): ContributionProviderCache<any> {
    return this.store.get(id);
  }

  static setStore(id: ServiceIdentifier<any>, cache: ContributionProviderCache<any>): void {
    this.store.set(id, cache);
  }

  static refreshAllContributions(): void {
    this.store.forEach(cache => {
      cache.refresh();
    });
  }
}
