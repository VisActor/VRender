import type { IGraphic, IStage } from '../../interface';
import { StateDefinitionCompiler } from './state-definition-compiler';
import type { CompiledStateDefinition, StateDefinitionsInput } from './state-definition';

export interface SharedStateScope<T extends Record<string, any> = Record<string, any>> {
  ownerStage?: IStage;
  parentScope?: SharedStateScope<T>;
  themeStateDefinitions?: StateDefinitionsInput<T>;
  localStateDefinitions?: StateDefinitionsInput<T>;
  effectiveSourceDefinitions: StateDefinitionsInput<T>;
  effectiveCompiledDefinitions: Map<string, CompiledStateDefinition<T>>;
  revision: number;
  parentRevisionAtBuild?: number;
  dirty: boolean;
  subtreeActiveDescendants: Set<IGraphic>;
}

const compiler = new StateDefinitionCompiler<any>();

function buildEffectiveSourceDefinitions<T extends Record<string, any>>(
  parentScope?: SharedStateScope<T>,
  localStateDefinitions?: StateDefinitionsInput<T>,
  themeStateDefinitions?: StateDefinitionsInput<T>
): StateDefinitionsInput<T> {
  return Object.assign(
    {} as StateDefinitionsInput<T>,
    parentScope ? parentScope.effectiveSourceDefinitions : themeStateDefinitions,
    localStateDefinitions
  );
}

export function createRootSharedStateScope<T extends Record<string, any> = Record<string, any>>(
  stage: IStage,
  themeStateDefinitions?: StateDefinitionsInput<T>
): SharedStateScope<T> {
  return rebuildSharedStateScope(
    {
      ownerStage: stage,
      themeStateDefinitions,
      effectiveSourceDefinitions: {} as StateDefinitionsInput<T>,
      effectiveCompiledDefinitions: new Map(),
      revision: 0,
      dirty: false,
      subtreeActiveDescendants: new Set()
    },
    0
  );
}

export function createGroupSharedStateScope<T extends Record<string, any> = Record<string, any>>(
  group: IGraphic,
  parentScope?: SharedStateScope<T>,
  localStateDefinitions?: StateDefinitionsInput<T>
): SharedStateScope<T> {
  return rebuildSharedStateScope(
    {
      ownerStage: group.stage,
      parentScope,
      localStateDefinitions,
      effectiveSourceDefinitions: {} as StateDefinitionsInput<T>,
      effectiveCompiledDefinitions: new Map(),
      revision: 0,
      dirty: false,
      subtreeActiveDescendants: new Set()
    },
    0
  );
}

export function setSharedStateScopeParent<T extends Record<string, any> = Record<string, any>>(
  scope: SharedStateScope<T>,
  parentScope?: SharedStateScope<T>
): boolean {
  if (scope.parentScope === parentScope) {
    return false;
  }

  scope.parentScope = parentScope;
  scope.dirty = true;
  return true;
}

export function setSharedStateScopeLocalDefinitions<T extends Record<string, any> = Record<string, any>>(
  scope: SharedStateScope<T>,
  localStateDefinitions?: StateDefinitionsInput<T>
): boolean {
  if (scope.localStateDefinitions === localStateDefinitions) {
    return false;
  }

  scope.localStateDefinitions = localStateDefinitions;
  rebuildSharedStateScope(scope);
  return true;
}

export function setRootSharedStateScopeThemeDefinitions<T extends Record<string, any> = Record<string, any>>(
  scope: SharedStateScope<T>,
  themeStateDefinitions?: StateDefinitionsInput<T>
): boolean {
  if (scope.themeStateDefinitions === themeStateDefinitions) {
    return false;
  }

  scope.themeStateDefinitions = themeStateDefinitions;
  rebuildSharedStateScope(scope);
  return true;
}

export function rebuildSharedStateScope<T extends Record<string, any> = Record<string, any>>(
  scope: SharedStateScope<T>,
  revision: number = scope.revision + 1
): SharedStateScope<T> {
  const effectiveSourceDefinitions = buildEffectiveSourceDefinitions(
    scope.parentScope,
    scope.localStateDefinitions,
    scope.themeStateDefinitions
  );

  scope.effectiveSourceDefinitions = effectiveSourceDefinitions;
  scope.effectiveCompiledDefinitions = compiler.compile(effectiveSourceDefinitions);
  scope.parentRevisionAtBuild = scope.parentScope?.revision;
  scope.revision = revision;
  scope.dirty = false;

  return scope;
}

export function ensureSharedStateScopeFresh<T extends Record<string, any> = Record<string, any>>(
  scope?: SharedStateScope<T>
): SharedStateScope<T> | undefined {
  if (!scope) {
    return undefined;
  }

  if (scope.parentScope) {
    ensureSharedStateScopeFresh(scope.parentScope);
  }

  if (scope.dirty || (scope.parentScope && scope.parentRevisionAtBuild !== scope.parentScope.revision)) {
    rebuildSharedStateScope(scope);
  }

  return scope;
}

export function collectSharedStateScopeChain<T extends Record<string, any> = Record<string, any>>(
  scope?: SharedStateScope<T>
): SharedStateScope<T>[] {
  const chain: SharedStateScope<T>[] = [];
  let current = scope;

  while (current) {
    chain.push(current);
    current = current.parentScope;
  }

  return chain;
}
