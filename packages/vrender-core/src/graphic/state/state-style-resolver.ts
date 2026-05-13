import type { StateProxy, StateSort } from './state-model';

export type StateMergeMode = 'shallow' | 'deep';

export interface IStateStyleResolverOptions {
  mergeMode?: StateMergeMode;
}

export interface IStateStyleResolver<T> {
  resolve: (
    normalAttrs: Partial<T>,
    states: Record<string, Partial<T>> | undefined,
    stateProxy: StateProxy<T> | undefined,
    currentStates: string[],
    stateSort?: StateSort
  ) => Partial<T>;
}

function isPlainObject(value: unknown): value is Record<string, any> {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}

function cloneValue<T>(value: T): T {
  if (!isPlainObject(value)) {
    return value;
  }

  const clone: Record<string, any> = {};
  for (const key in value) {
    if (!Object.prototype.hasOwnProperty.call(value, key)) {
      continue;
    }
    clone[key] = cloneValue((value as Record<string, any>)[key]);
  }
  return clone as T;
}

function deepMerge(base: Record<string, any>, value: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = cloneValue(base) || {};

  for (const key in value) {
    if (!Object.prototype.hasOwnProperty.call(value, key)) {
      continue;
    }

    const nextValue = value[key];
    const previousValue = result[key];

    if (isPlainObject(previousValue) && isPlainObject(nextValue)) {
      result[key] = deepMerge(previousValue, nextValue);
    } else {
      result[key] = cloneValue(nextValue);
    }
  }

  return result;
}

export class StateStyleResolver<T extends Record<string, any> = Record<string, any>> implements IStateStyleResolver<T> {
  constructor(private readonly options: IStateStyleResolverOptions = {}) {}

  resolve(
    normalAttrs: Partial<T>,
    states: Record<string, Partial<T>> | undefined,
    stateProxy: StateProxy<T> | undefined,
    currentStates: string[],
    stateSort?: StateSort
  ): Partial<T> {
    const mergeMode = this.options.mergeMode ?? 'shallow';
    const sortedStates = stateSort ? currentStates.slice().sort(stateSort) : currentStates.slice();
    const resolvedAttrs: Partial<T> = {};

    sortedStates.forEach(stateName => {
      const attrs = stateProxy ? stateProxy(stateName, sortedStates) : states?.[stateName];

      if (attrs == null) {
        return;
      }

      for (const key in attrs) {
        if (!Object.prototype.hasOwnProperty.call(attrs, key)) {
          continue;
        }

        const nextValue = attrs[key];

        if (
          mergeMode === 'deep' &&
          isPlainObject(nextValue) &&
          (isPlainObject((resolvedAttrs as Record<string, any>)[key]) ||
            isPlainObject((normalAttrs as Record<string, any>)[key]))
        ) {
          const baseValue = isPlainObject((resolvedAttrs as Record<string, any>)[key])
            ? (resolvedAttrs as Record<string, any>)[key]
            : isPlainObject((normalAttrs as Record<string, any>)[key])
            ? (normalAttrs as Record<string, any>)[key]
            : {};
          (resolvedAttrs as Record<string, any>)[key] = deepMerge(baseValue, nextValue);
        } else {
          (resolvedAttrs as Record<string, any>)[key] = cloneValue(nextValue);
        }
      }
    });

    return resolvedAttrs;
  }
}
