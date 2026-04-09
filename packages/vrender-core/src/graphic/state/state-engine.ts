import type {
  CompiledStateDefinition,
  IStateEngineOptions,
  StateDefinitionsInput,
  StateTransitionResult
} from './state-definition';
import { getStageStatePerfMonitor } from './state-perf-monitor';

function isPlainObject(value: unknown): value is Record<string, any> {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}

function cloneValue<T>(value: T): T {
  if (!isPlainObject(value)) {
    return value;
  }

  const clone: Record<string, any> = {};
  Object.keys(value).forEach(key => {
    clone[key] = cloneValue((value as Record<string, any>)[key]);
  });
  return clone as T;
}

function deepMerge(base: Record<string, any>, value: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = cloneValue(base) ?? {};

  Object.keys(value).forEach(key => {
    const nextValue = value[key];
    const previousValue = result[key];

    if (isPlainObject(previousValue) && isPlainObject(nextValue)) {
      result[key] = deepMerge(previousValue, nextValue);
      return;
    }

    result[key] = cloneValue(nextValue);
  });

  return result;
}

const FULL_DEFINITION_KEYS = new Set([
  'name',
  'patch',
  'priority',
  'exclude',
  'suppress',
  'resolver',
  'declaredAffectedKeys'
]);

export class StateEngine<T extends Record<string, any> = Record<string, any>> {
  private readonly compiledDefinitions: Map<string, CompiledStateDefinition<T>>;
  private readonly stateSort?: (a: string, b: string) => number;
  private readonly stateProxy?: (stateName: string, targetStates?: string[]) => Partial<T> | undefined;
  private readonly stateProxyEligibility?: (stateName: string) => boolean;
  private readonly states?: StateDefinitionsInput<T>;
  private readonly mergeMode: 'shallow' | 'deep';

  private _activeStates: string[] = [];
  private _effectiveStates: string[] = [];
  private _suppressed: string[] = [];
  private _resolvedPatch: Partial<T> = {};
  private resolverPatchCache = new Map<string, Partial<T>>();
  private resolverCacheKey = '';
  private resolverCacheValid = false;
  private graphic: any;
  private baseAttributes: Partial<T> = {};

  constructor(options: IStateEngineOptions<T>) {
    this.compiledDefinitions = options.compiledDefinitions;
    this.stateSort = options.stateSort;
    this.stateProxy = options.stateProxy;
    this.stateProxyEligibility = options.stateProxyEligibility;
    this.states = options.states;
    this.mergeMode = options.mergeMode ?? 'shallow';
  }

  get activeStates(): ReadonlyArray<string> {
    return this._activeStates;
  }

  get effectiveStates(): ReadonlyArray<string> {
    return this._effectiveStates;
  }

  get resolvedPatch(): Partial<T> {
    return this._resolvedPatch;
  }

  get suppressed(): ReadonlyArray<string> {
    return this._suppressed;
  }

  setResolveContext(graphic: any, baseAttributes: Partial<T>): void {
    this.graphic = graphic;
    this.baseAttributes = baseAttributes;
  }

  applyStates(stateNames: string[]): StateTransitionResult {
    const uniqueStates = Array.from(new Set(stateNames));
    const sortedStates = this.sortStates(uniqueStates);
    const adjudicated = this.adjudicate(sortedStates);
    const activeStates = adjudicated.active;
    const effectiveStates = activeStates.filter(stateName => !adjudicated.suppressedSet.has(stateName));
    const suppressed = activeStates.filter(stateName => adjudicated.suppressedSet.has(stateName));

    const changed =
      !this.sameArray(this._activeStates, activeStates) ||
      !this.sameArray(this._effectiveStates, effectiveStates) ||
      !this.sameArray(this._suppressed, suppressed);

    this._activeStates = activeStates;
    this._effectiveStates = effectiveStates;
    this._suppressed = suppressed;

    if (changed || !this.resolverCacheValid) {
      this.recomputePatch(effectiveStates);
    }

    return {
      changed,
      activeStates: [...this._activeStates],
      effectiveStates: [...this._effectiveStates],
      suppressed: [...this._suppressed]
    };
  }

  addState(stateName: string, keepCurrentStates?: boolean): StateTransitionResult {
    if (this._activeStates.includes(stateName) && (keepCurrentStates || this._activeStates.length === 1)) {
      return {
        changed: false,
        activeStates: [...this._activeStates],
        effectiveStates: [...this._effectiveStates],
        suppressed: [...this._suppressed]
      };
    }

    const nextStates =
      keepCurrentStates && this._activeStates.length ? this._activeStates.concat([stateName]) : [stateName];

    return this.applyStates(nextStates);
  }

  removeState(stateNames: string | string[]): StateTransitionResult {
    if (!this._activeStates.length) {
      return {
        changed: false,
        activeStates: [],
        effectiveStates: [],
        suppressed: []
      };
    }

    const filteredNames = Array.isArray(stateNames)
      ? this._activeStates.filter(stateName => !stateNames.includes(stateName))
      : this._activeStates.filter(stateName => stateName !== stateNames);

    if (filteredNames.length === this._activeStates.length) {
      return {
        changed: false,
        activeStates: [...this._activeStates],
        effectiveStates: [...this._effectiveStates],
        suppressed: [...this._suppressed]
      };
    }

    return this.applyStates(filteredNames);
  }

  toggleState(stateName: string): StateTransitionResult {
    if (this.hasState(stateName)) {
      return this.removeState(stateName);
    }

    return this.applyStates(this._activeStates.concat([stateName]));
  }

  clearStates(): StateTransitionResult {
    const changed = this._activeStates.length > 0 || this._effectiveStates.length > 0 || this._suppressed.length > 0;
    this._activeStates = [];
    this._effectiveStates = [];
    this._suppressed = [];
    this._resolvedPatch = {};
    this.resolverPatchCache.clear();
    this.resolverCacheKey = '';
    this.resolverCacheValid = false;

    return {
      changed,
      activeStates: [],
      effectiveStates: [],
      suppressed: []
    };
  }

  invalidateResolverCache(): void {
    this.resolverPatchCache.clear();
    this.resolverCacheKey = '';
    this.resolverCacheValid = false;
    getStageStatePerfMonitor(this.graphic?.stage)?.recordResolver('invalidations');
  }

  hasState(stateName?: string): boolean {
    if (!this._activeStates.length) {
      return false;
    }

    if (stateName == null) {
      return true;
    }

    return this._activeStates.includes(stateName);
  }

  getCompatPatch(stateName: string): Partial<T> | undefined {
    const targetStates = this._activeStates.length ? this._activeStates : this._effectiveStates;
    const canUseStateProxy = this.canUseStateProxy(stateName);
    const proxyPatch = canUseStateProxy ? this.stateProxy?.(stateName, targetStates) : undefined;
    if (this.stateProxy && canUseStateProxy) {
      return proxyPatch ?? undefined;
    }

    const value = this.states?.[stateName];
    if (value == null) {
      return undefined;
    }

    if (!isPlainObject(value)) {
      return value as Partial<T>;
    }

    const keys = Object.keys(value);
    const hasFullKey = keys.some(key => FULL_DEFINITION_KEYS.has(key));
    if (!hasFullKey) {
      return value as Partial<T>;
    }

    return cloneValue(((value as Record<string, any>).patch ?? undefined) as Partial<T> | undefined);
  }

  private sortStates(states: string[]): string[] {
    const withDefinition: string[] = [];
    const withoutDefinition: string[] = [];

    states.forEach(stateName => {
      if (this.compiledDefinitions.has(stateName)) {
        withDefinition.push(stateName);
      } else {
        withoutDefinition.push(stateName);
      }
    });

    withDefinition.sort((left, right) => {
      const leftDefinition = this.compiledDefinitions.get(left);
      const rightDefinition = this.compiledDefinitions.get(right);
      if (!leftDefinition || !rightDefinition) {
        return 0;
      }
      if (leftDefinition.priority !== rightDefinition.priority) {
        return leftDefinition.priority - rightDefinition.priority;
      }
      return leftDefinition.rank - rightDefinition.rank;
    });

    if (this.stateSort && withoutDefinition.length > 1) {
      withoutDefinition.sort(this.stateSort);
    }

    return withDefinition.concat(withoutDefinition);
  }

  private adjudicate(sortedStates: string[]): { active: string[]; suppressedSet: Set<string> } {
    const candidate = sortedStates.slice();
    const suppressedSet = new Set<string>();

    for (let index = candidate.length - 1; index >= 0; index--) {
      const stateName = candidate[index];
      const definition = this.compiledDefinitions.get(stateName);
      if (!definition) {
        continue;
      }

      definition.exclude.forEach(excludedState => {
        const excludedIndex = candidate.indexOf(excludedState);
        if (excludedIndex === -1) {
          return;
        }

        candidate.splice(excludedIndex, 1);
        if (excludedIndex < index) {
          index -= 1;
        }
      });

      definition.suppress.forEach(suppressedState => {
        suppressedSet.add(suppressedState);
      });
    }

    return {
      active: candidate,
      suppressedSet
    };
  }

  private recomputePatch(effectiveStates: string[]): void {
    const perfMonitor = getStageStatePerfMonitor(this.graphic?.stage);
    const patchStart = perfMonitor ? performance.now() : 0;
    let resolverCost = 0;
    const cacheKey = effectiveStates.join(',');
    const nextPatch: Partial<T> = {};
    perfMonitor?.recordAllocation('patchObjectsCreated');

    if (this.resolverCacheValid && this.resolverCacheKey === cacheKey) {
      effectiveStates.forEach(stateName => {
        const canUseStateProxy = this.canUseStateProxy(stateName);
        const proxyPatch = canUseStateProxy ? this.stateProxy?.(stateName, effectiveStates) : undefined;
        if (this.stateProxy && canUseStateProxy) {
          if (proxyPatch != null) {
            this.mergeInto(nextPatch, proxyPatch);
          }
          return;
        }

        const definition = this.compiledDefinitions.get(stateName);
        if (!definition) {
          const compatPatch = this.getCompatPatch(stateName);
          if (compatPatch) {
            this.mergeInto(nextPatch, compatPatch);
          }
          return;
        }

        if (definition.patch) {
          this.mergeInto(nextPatch, definition.patch);
        }

        if (definition.hasResolver) {
          const cachedPatch = this.resolverPatchCache.get(stateName);
          if (cachedPatch) {
            perfMonitor?.recordResolver('cacheHits');
            this.mergeInto(nextPatch, cachedPatch);
          }
        }
      });
    } else {
      this.resolverPatchCache.clear();
      this.resolverCacheKey = cacheKey;

      effectiveStates.forEach(stateName => {
        const canUseStateProxy = this.canUseStateProxy(stateName);
        const proxyPatch = canUseStateProxy ? this.stateProxy?.(stateName, effectiveStates) : undefined;
        if (this.stateProxy && canUseStateProxy) {
          if (proxyPatch != null) {
            this.mergeInto(nextPatch, proxyPatch);
          }
          return;
        }

        const definition = this.compiledDefinitions.get(stateName);
        if (!definition) {
          const compatPatch = this.getCompatPatch(stateName);
          if (compatPatch) {
            this.mergeInto(nextPatch, compatPatch);
          }
          return;
        }

        if (definition.patch) {
          this.mergeInto(nextPatch, definition.patch);
        }

        if (definition.hasResolver && definition.resolver) {
          perfMonitor?.recordResolver('cacheMisses');
          const resolverStart = perfMonitor ? performance.now() : 0;
          const resolverPatch = definition.resolver({
            graphic: this.graphic,
            activeStates: this._activeStates,
            effectiveStates: this._effectiveStates,
            baseAttributes: this.baseAttributes,
            resolvedPatch: nextPatch
          });
          if (perfMonitor) {
            const duration = performance.now() - resolverStart;
            resolverCost += duration;
            perfMonitor.recordCost('resolver', duration);
          }
          if (resolverPatch) {
            this.resolverPatchCache.set(stateName, resolverPatch);
            this.mergeInto(nextPatch, resolverPatch);
          }
        }
      });

      this.resolverCacheValid = true;
    }

    this._resolvedPatch = nextPatch;
    if (perfMonitor) {
      const totalCost = performance.now() - patchStart;
      perfMonitor.recordCost('patch', Math.max(0, totalCost - resolverCost));
    }
  }

  private mergeInto(target: Partial<T>, patch: Partial<T>): void {
    if (this.mergeMode === 'deep') {
      Object.keys(patch).forEach(key => {
        const nextValue = (patch as Record<string, any>)[key];
        const previousValue = (target as Record<string, any>)[key];
        const baseValue = (this.baseAttributes as Record<string, any>)?.[key];

        if (isPlainObject(previousValue) && isPlainObject(nextValue)) {
          (target as Record<string, any>)[key] = deepMerge(previousValue, nextValue);
          return;
        }

        if (!isPlainObject(previousValue) && isPlainObject(baseValue) && isPlainObject(nextValue)) {
          (target as Record<string, any>)[key] = deepMerge(baseValue, nextValue);
          return;
        }

        (target as Record<string, any>)[key] = cloneValue(nextValue);
      });
      return;
    }

    Object.keys(patch).forEach(key => {
      (target as Record<string, any>)[key] = cloneValue((patch as Record<string, any>)[key]);
    });
  }

  private sameArray(left: readonly string[], right: readonly string[]): boolean {
    if (left.length !== right.length) {
      return false;
    }

    for (let index = 0; index < left.length; index++) {
      if (left[index] !== right[index]) {
        return false;
      }
    }

    return true;
  }

  private canUseStateProxy(stateName: string): boolean {
    if (!this.stateProxy) {
      return false;
    }

    return this.stateProxyEligibility ? this.stateProxyEligibility(stateName) : true;
  }
}
