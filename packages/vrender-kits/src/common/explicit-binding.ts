import type { IContributionProvider } from '@visactor/vrender-core';

export function resolveContainerBinding<T>(container: any, serviceIdentifier: any): T {
  const [instance] = container.getAll(serviceIdentifier) as T[];
  if (instance == null) {
    throw new Error(`No binding found for ${String(serviceIdentifier)}.`);
  }
  return instance;
}

export function createContributionProvider<T>(serviceIdentifier: any, container: any): IContributionProvider<T> {
  let caches: T[] | undefined;

  return {
    getContributions: () => {
      if (!caches) {
        caches = container.isBound(serviceIdentifier) ? (container.getAll(serviceIdentifier) as T[]) : [];
      }
      return caches;
    }
  };
}
