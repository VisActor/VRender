import type {
  CompiledStateDefinition,
  StateDefinition,
  StateDefinitionsInput,
  StateResolveContext
} from './state-definition';

const FULL_DEFINITION_KEYS = new Set([
  'name',
  'patch',
  'priority',
  'exclude',
  'suppress',
  'resolver',
  'declaredAffectedKeys'
]);

function isPlainObject(value: unknown): value is Record<string, any> {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}

function normalizePatch<T extends Record<string, any>>(value: unknown): Partial<T> | undefined {
  return value == null ? undefined : (value as Partial<T>);
}

export class StateDefinitionCompiler<T extends Record<string, any> = Record<string, any>> {
  compile(
    definitions: StateDefinitionsInput<T> = {} as StateDefinitionsInput<T>
  ): Map<string, CompiledStateDefinition<T>> {
    const normalizedEntries = Object.keys(definitions).map(name => {
      const normalized = this.normalizeDefinition(name, definitions[name]);
      return [name, normalized] as const;
    });

    const rankOrder = normalizedEntries
      .map(([, definition]) => definition)
      .sort((left, right) => {
        const leftPriority = left.priority ?? 0;
        const rightPriority = right.priority ?? 0;
        if (leftPriority !== rightPriority) {
          return leftPriority - rightPriority;
        }
        return left.name.localeCompare(right.name);
      });

    const rankMap = new Map<string, number>();
    rankOrder.forEach((definition, index) => {
      rankMap.set(definition.name, index);
    });

    const compiled = new Map<string, CompiledStateDefinition<T>>();
    normalizedEntries.forEach(([, definition]) => {
      const declaredAffectedKeys = definition.declaredAffectedKeys
        ? new Set(Array.from(definition.declaredAffectedKeys))
        : undefined;
      const staticAffectedKeys = definition.patch ? new Set(Object.keys(definition.patch)) : new Set<string>();
      const affectedKeys = new Set<string>(staticAffectedKeys);
      declaredAffectedKeys?.forEach(key => affectedKeys.add(key));

      compiled.set(definition.name, {
        name: definition.name,
        priority: definition.priority ?? 0,
        rank: rankMap.get(definition.name) ?? 0,
        patch: normalizePatch<T>(definition.patch),
        resolver: definition.resolver,
        declaredAffectedKeys,
        exclude: new Set(definition.exclude ?? []),
        suppress: new Set(definition.suppress ?? []),
        hasResolver: typeof definition.resolver === 'function',
        affectedKeys
      });
    });

    this.expandRelationClosure(compiled, 'exclude');
    this.expandRelationClosure(compiled, 'suppress');

    return compiled;
  }

  private normalizeDefinition(name: string, value: Partial<T> | StateDefinition<T> | undefined): StateDefinition<T> {
    if (value == null) {
      return {
        name,
        priority: 0,
        patch: undefined
      };
    }

    const keys = isPlainObject(value) ? Object.keys(value) : [];
    const hasFullKey = keys.some(key => FULL_DEFINITION_KEYS.has(key));
    if (hasFullKey) {
      const definition = value as StateDefinition<T>;
      return {
        name: definition.name ?? name,
        priority: definition.priority ?? 0,
        rank: definition.rank,
        patch: normalizePatch<T>(definition.patch),
        resolver: definition.resolver as ((ctx: StateResolveContext<T>) => Partial<T> | void) | undefined,
        declaredAffectedKeys: definition.declaredAffectedKeys,
        exclude: definition.exclude,
        suppress: definition.suppress
      };
    }

    return {
      name,
      priority: 0,
      patch: value as Partial<T>
    };
  }

  private expandRelationClosure(
    compiled: Map<string, CompiledStateDefinition<T>>,
    relation: 'exclude' | 'suppress'
  ): void {
    const rawRelationMap = new Map<string, Set<string>>();

    compiled.forEach((definition, name) => {
      rawRelationMap.set(name, new Set(definition[relation]));
    });

    compiled.forEach((definition, origin) => {
      const closure = new Set<string>();
      const walk = (stateName: string, stack: string[]) => {
        const nextStates = rawRelationMap.get(stateName);
        if (!nextStates || !nextStates.size) {
          return;
        }

        nextStates.forEach(nextState => {
          if (nextState === origin) {
            console.warn(
              `[StateDefinitionCompiler] circular ${relation} relation detected: ${stack.join(' -> ')} -> ${origin}`
            );
            return;
          }

          if (stack.includes(nextState)) {
            console.warn(
              `[StateDefinitionCompiler] circular ${relation} relation detected: ${stack.join(' -> ')} -> ${nextState}`
            );
            return;
          }

          if (closure.has(nextState)) {
            return;
          }

          closure.add(nextState);
          walk(nextState, stack.concat(nextState));
        });
      };

      walk(origin, [origin]);
      definition[relation] = closure;
    });
  }
}
