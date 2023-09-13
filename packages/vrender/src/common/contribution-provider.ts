import type { interfaces } from 'inversify';
import type { IContributionProvider } from '../interface';

export const ContributionProvider = Symbol('ContributionProvider');

class ContributionProviderCache<T> implements IContributionProvider<T> {
  protected caches?: T[];
  protected serviceIdentifier: interfaces.ServiceIdentifier<T>;
  protected container: interfaces.Container;

  constructor(serviceIdentifier: interfaces.ServiceIdentifier<T>, container: interfaces.Container) {
    this.serviceIdentifier = serviceIdentifier;
    this.container = container;
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
