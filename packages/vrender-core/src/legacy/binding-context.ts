import type { ServiceIdentifier } from '../common/explicit-binding';

/**
 * Lightweight legacy binding context kept only for the remaining bootstrap compatibility path.
 * It replaces the removed container/inversify bridge with the minimal binding features we still need.
 */
export type LegacyNamedIdentifier = string | number | symbol;

export interface ILegacyBindingResolveContext {
  container: ILegacyBindingContext;
}

export interface ILegacyBindingSyntax<T = unknown> {
  to: (constructor: new (...args: any[]) => T) => ILegacyBindingSyntax<T>;
  toSelf: () => ILegacyBindingSyntax<T>;
  toDynamicValue: (factory: (context: ILegacyBindingResolveContext) => T) => ILegacyBindingSyntax<T>;
  toConstantValue: (value: T) => ILegacyBindingSyntax<T>;
  toService: (serviceIdentifier: ServiceIdentifier) => ILegacyBindingSyntax<T>;
  inSingletonScope: () => ILegacyBindingSyntax<T>;
  whenTargetNamed: (name: LegacyNamedIdentifier) => ILegacyBindingSyntax<T>;
}

export interface ILegacyBindContext {
  bind: <T>(serviceIdentifier: ServiceIdentifier<T>) => ILegacyBindingSyntax<T>;
}

export interface ILegacyBindingContext extends ILegacyBindContext {
  rebind: <T>(serviceIdentifier: ServiceIdentifier<T>) => ILegacyBindingSyntax<T>;
  isBound: <T>(serviceIdentifier: ServiceIdentifier<T>) => boolean;
  getAll: <T>(serviceIdentifier: ServiceIdentifier<T>) => T[];
  getNamed: <T>(serviceIdentifier: ServiceIdentifier<T>, name: LegacyNamedIdentifier) => T | undefined;
}

type LegacyBindingType = 'constructor' | 'constant' | 'dynamic' | 'service';
type LegacyBindingScope = 'transient' | 'singleton';

interface ILegacyBindingRecord<T = unknown> {
  serviceIdentifier: ServiceIdentifier<T>;
  implementationType?: LegacyBindingType;
  implementationConstructor?: new (...args: any[]) => T;
  implementationFactory?: (context: ILegacyBindingResolveContext) => T;
  implementationValue?: T;
  linkedServiceIdentifier?: ServiceIdentifier;
  scope: LegacyBindingScope;
  named?: LegacyNamedIdentifier;
  cached: boolean;
  cachedValue?: T;
}

class LegacyBindingSyntax<T> implements ILegacyBindingSyntax<T> {
  constructor(private readonly record: ILegacyBindingRecord<T>) {}

  to(constructor: new (...args: any[]) => T): ILegacyBindingSyntax<T> {
    this.record.implementationType = 'constructor';
    this.record.implementationConstructor = constructor;
    this.record.cached = false;
    this.record.cachedValue = undefined;
    return this;
  }

  toSelf(): ILegacyBindingSyntax<T> {
    return this.to(this.record.serviceIdentifier as new (...args: any[]) => T);
  }

  toDynamicValue(factory: (context: ILegacyBindingResolveContext) => T): ILegacyBindingSyntax<T> {
    this.record.implementationType = 'dynamic';
    this.record.implementationFactory = factory;
    this.record.cached = false;
    this.record.cachedValue = undefined;
    return this;
  }

  toConstantValue(value: T): ILegacyBindingSyntax<T> {
    this.record.implementationType = 'constant';
    this.record.implementationValue = value;
    this.record.cached = true;
    this.record.cachedValue = value;
    return this;
  }

  toService(serviceIdentifier: ServiceIdentifier): ILegacyBindingSyntax<T> {
    this.record.implementationType = 'service';
    this.record.linkedServiceIdentifier = serviceIdentifier;
    this.record.cached = false;
    this.record.cachedValue = undefined;
    return this;
  }

  inSingletonScope(): ILegacyBindingSyntax<T> {
    this.record.scope = 'singleton';
    return this;
  }

  whenTargetNamed(name: LegacyNamedIdentifier): ILegacyBindingSyntax<T> {
    this.record.named = name;
    return this;
  }
}

class LegacyBindingContext implements ILegacyBindingContext {
  private readonly bindings = new Map<ServiceIdentifier, ILegacyBindingRecord[]>();

  bind = <T>(serviceIdentifier: ServiceIdentifier<T>): ILegacyBindingSyntax<T> => {
    const record: ILegacyBindingRecord<T> = {
      serviceIdentifier,
      scope: 'transient',
      cached: false
    };
    const records = this.bindings.get(serviceIdentifier);
    if (records) {
      records.push(record);
    } else {
      this.bindings.set(serviceIdentifier, [record]);
    }
    return new LegacyBindingSyntax(record);
  };

  rebind = <T>(serviceIdentifier: ServiceIdentifier<T>): ILegacyBindingSyntax<T> => {
    this.bindings.delete(serviceIdentifier);
    return this.bind(serviceIdentifier);
  };

  isBound = <T>(serviceIdentifier: ServiceIdentifier<T>): boolean => {
    return (this.bindings.get(serviceIdentifier)?.length ?? 0) > 0;
  };

  getAll = <T>(serviceIdentifier: ServiceIdentifier<T>): T[] => {
    const records = this.bindings.get(serviceIdentifier);
    if (!records?.length) {
      return [];
    }
    return records
      .map(record => this.resolveBinding(record) as T | undefined)
      .filter((value): value is T => value !== undefined);
  };

  getNamed = <T>(serviceIdentifier: ServiceIdentifier<T>, name: LegacyNamedIdentifier): T | undefined => {
    const records = this.bindings.get(serviceIdentifier);
    if (!records?.length) {
      return undefined;
    }
    const record = records.find(item => item.named === name);
    return record ? (this.resolveBinding(record) as T | undefined) : undefined;
  };

  private resolveBinding<T>(record: ILegacyBindingRecord<T>): T | undefined {
    if (record.scope === 'singleton' && record.cached) {
      return record.cachedValue;
    }

    let value: T | undefined;
    switch (record.implementationType) {
      case 'constant':
        value = record.implementationValue;
        break;
      case 'constructor':
        value = record.implementationConstructor ? new record.implementationConstructor() : undefined;
        break;
      case 'dynamic':
        value = record.implementationFactory?.({ container: this });
        break;
      case 'service':
        if (record.linkedServiceIdentifier) {
          [value] = this.getAll(record.linkedServiceIdentifier) as T[];
        }
        break;
      default:
        value = undefined;
    }

    if (record.scope === 'singleton') {
      record.cached = true;
      record.cachedValue = value;
    }

    return value;
  }
}

export function createLegacyBindingContext(): ILegacyBindingContext {
  return new LegacyBindingContext();
}
