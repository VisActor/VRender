export interface StateDefinition<T extends Record<string, any> = Record<string, any>> {
  name: string;
  priority?: number;
  rank?: number;
  patch?: Partial<T>;
  resolver?: (ctx: StateResolveContext<T>) => Partial<T> | void;
  declaredAffectedKeys?: string[] | Set<string>;
  exclude?: string[];
  suppress?: string[];
}

export interface CompiledStateDefinition<T extends Record<string, any> = Record<string, any>> {
  name: string;
  priority: number;
  rank: number;
  patch?: Partial<T>;
  resolver?: (ctx: StateResolveContext<T>) => Partial<T> | void;
  declaredAffectedKeys?: Set<string>;
  exclude: Set<string>;
  suppress: Set<string>;
  hasResolver: boolean;
  affectedKeys: Set<string>;
}

export interface StateResolveContext<T extends Record<string, any> = Record<string, any>> {
  graphic: any;
  activeStates: ReadonlyArray<string>;
  effectiveStates: ReadonlyArray<string>;
  baseAttributes: Partial<T>;
  resolvedPatch: Partial<T>;
}

export interface StateTransitionResult {
  changed: boolean;
  activeStates: string[];
  effectiveStates: string[];
  suppressed: string[];
}

export type StateDefinitionsInput<T extends Record<string, any> = Record<string, any>> = Record<
  string,
  Partial<T> | StateDefinition<T>
>;

export interface IStateEngineOptions<T extends Record<string, any> = Record<string, any>> {
  compiledDefinitions: Map<string, CompiledStateDefinition<T>>;
  stateSort?: (a: string, b: string) => number;
  stateProxy?: (stateName: string, targetStates?: string[]) => Partial<T> | undefined;
  stateProxyEligibility?: (stateName: string) => boolean;
  states?: StateDefinitionsInput<T>;
  mergeMode?: 'shallow' | 'deep';
}
