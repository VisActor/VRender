export type ServiceIdentifier<T = unknown> = string | symbol | (abstract new (...args: any[]) => T);

export interface IBindingResolver {
  getAll: <T>(serviceIdentifier: ServiceIdentifier<T>) => T[];
}

function describeServiceIdentifier(serviceIdentifier: ServiceIdentifier): string {
  if (typeof serviceIdentifier === 'string') {
    return serviceIdentifier;
  }
  if (typeof serviceIdentifier === 'symbol') {
    return serviceIdentifier.toString();
  }
  if (typeof serviceIdentifier === 'function' && serviceIdentifier.name) {
    return serviceIdentifier.name;
  }
  return 'unknown service identifier';
}

export function resolveContainerBinding<T>(container: IBindingResolver, serviceIdentifier: ServiceIdentifier<T>): T {
  const [instance] = container.getAll<T>(serviceIdentifier);
  if (instance == null) {
    throw new Error(`No binding found for ${describeServiceIdentifier(serviceIdentifier)}.`);
  }
  return instance;
}
