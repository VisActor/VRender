import type { StateDefinition, StateDefinitionsInput } from './state-definition';
import type { StateEngine } from './state-engine';

export type StateSort = (stateA: string, stateB: string) => number;

export type StateProxy<T> = (stateName: string, targetStates?: string[]) => Partial<T> | undefined;

export interface IStateModelOptions<T> {
  states?: StateDefinitionsInput<T>;
  currentStates?: string[];
  stateSort?: StateSort;
  stateProxy?: StateProxy<T>;
  exclusiveGroups?: Record<string, string[]>;
  stateEngine?: StateEngine<T>;
}

export interface IStateModelTransition {
  changed: boolean;
  states: string[];
  effectiveStates?: string[];
}

export class StateModel<T extends Record<string, any> = Record<string, any>> {
  states?: StateDefinitionsInput<T>;
  currentStates?: string[];
  stateSort?: StateSort;
  stateProxy?: StateProxy<T>;
  readonly stateEngine?: StateEngine<T>;

  private readonly exclusiveGroupMap = new Map<string, string>();
  private readonly exclusiveGroups = new Map<string, string[]>();

  constructor(options: IStateModelOptions<T> = {}) {
    this.states = options.states;
    this.currentStates = options.currentStates ? [...options.currentStates] : undefined;
    this.stateSort = options.stateSort;
    this.stateProxy = options.stateProxy;
    this.stateEngine = options.stateEngine;

    if (
      this.stateEngine &&
      options.currentStates &&
      !this.sameStates(this.stateEngine.activeStates, options.currentStates)
    ) {
      this.stateEngine.applyStates(options.currentStates);
    }

    const exclusiveGroups = options.exclusiveGroups ?? {};
    for (const groupName in exclusiveGroups) {
      if (!Object.prototype.hasOwnProperty.call(exclusiveGroups, groupName)) {
        continue;
      }
      this.registerExclusiveGroup(groupName, exclusiveGroups[groupName]);
    }
  }

  getCurrentStates(): string[] {
    return this.currentStates ? [...this.currentStates] : [];
  }

  hasState(stateName?: string): boolean {
    if (this.stateEngine) {
      return this.stateEngine.hasState(stateName);
    }

    if (!this.currentStates || !this.currentStates.length) {
      return false;
    }

    if (stateName == null) {
      return true;
    }

    return this.currentStates.includes(stateName);
  }

  getState(stateName: string): Partial<T> | StateDefinition<T> | undefined {
    return this.states?.[stateName];
  }

  useStates(states: string[]): IStateModelTransition {
    if (this.stateEngine) {
      const result = this.stateEngine.applyStates(states);
      this.currentStates = [...result.activeStates];
      return {
        changed: result.changed,
        states: [...result.activeStates],
        effectiveStates: [...result.effectiveStates]
      };
    }

    if (!states.length) {
      return this.clearStates();
    }

    const previousStates = this.currentStates ?? [];
    const changed =
      previousStates.length !== states.length || states.some((stateName, index) => previousStates[index] !== stateName);

    const nextStates = this.sortStates(states);

    if (changed) {
      this.currentStates = nextStates;
    }

    return {
      changed,
      states: changed ? [...nextStates] : [...previousStates]
    };
  }

  clearStates(): IStateModelTransition {
    if (this.stateEngine) {
      const result = this.stateEngine.clearStates();
      this.currentStates = [];
      return {
        changed: result.changed,
        states: [],
        effectiveStates: []
      };
    }

    const changed = this.hasState();
    this.currentStates = [];

    return {
      changed,
      states: []
    };
  }

  addState(stateName: string, keepCurrentStates?: boolean): IStateModelTransition {
    if (this.stateEngine) {
      const result = this.stateEngine.addState(stateName, keepCurrentStates);
      this.currentStates = [...result.activeStates];
      return {
        changed: result.changed,
        states: [...result.activeStates],
        effectiveStates: [...result.effectiveStates]
      };
    }

    if (
      this.currentStates &&
      this.currentStates.includes(stateName) &&
      (keepCurrentStates || this.currentStates.length === 1)
    ) {
      return {
        changed: false,
        states: this.getCurrentStates()
      };
    }

    const nextStates =
      keepCurrentStates && this.currentStates?.length ? this.currentStates.concat([stateName]) : [stateName];

    return this.useStates(nextStates);
  }

  removeState(stateName: string | string[]): IStateModelTransition {
    if (this.stateEngine) {
      const result = this.stateEngine.removeState(stateName);
      this.currentStates = [...result.activeStates];
      return {
        changed: result.changed,
        states: [...result.activeStates],
        effectiveStates: [...result.effectiveStates]
      };
    }

    if (!this.currentStates) {
      return {
        changed: false,
        states: []
      };
    }

    const filter = Array.isArray(stateName) ? (s: string) => !stateName.includes(s) : (s: string) => s !== stateName;
    const nextStates = this.currentStates.filter(filter);

    if (nextStates.length === this.currentStates.length) {
      return {
        changed: false,
        states: this.getCurrentStates()
      };
    }

    return this.useStates(nextStates);
  }

  toggleState(stateName: string): IStateModelTransition {
    if (this.stateEngine) {
      const result = this.stateEngine.toggleState(stateName);
      this.currentStates = [...result.activeStates];
      return {
        changed: result.changed,
        states: [...result.activeStates],
        effectiveStates: [...result.effectiveStates]
      };
    }

    if (this.hasState(stateName)) {
      return this.removeState(stateName);
    }

    const nextStates = this.currentStates ? this.currentStates.slice() : [];
    if (!nextStates.includes(stateName)) {
      nextStates.push(stateName);
    }

    return this.useStates(nextStates);
  }

  sortStates(states: string[]): string[] {
    if (this.stateEngine) {
      return [...this.stateEngine.activeStates];
    }

    if (!this.stateSort) {
      return [...states];
    }

    return [...states].sort(this.stateSort);
  }

  registerExclusiveGroup(groupName: string, states: string[]): void {
    const uniqueStates = Array.from(new Set(states));
    this.exclusiveGroups.set(groupName, uniqueStates);
    uniqueStates.forEach(stateName => this.exclusiveGroupMap.set(stateName, groupName));
  }

  getExclusiveGroup(stateName: string): string | undefined {
    return this.exclusiveGroupMap.get(stateName);
  }

  getMutuallyExclusiveStates(stateName: string): string[] {
    const groupName = this.getExclusiveGroup(stateName);
    if (!groupName) {
      return [];
    }

    return (this.exclusiveGroups.get(groupName) ?? []).filter(name => name !== stateName);
  }

  isMutuallyExclusive(stateA: string, stateB: string): boolean {
    const groupName = this.getExclusiveGroup(stateA);
    return !!groupName && groupName === this.getExclusiveGroup(stateB) && stateA !== stateB;
  }

  get effectiveStates(): ReadonlyArray<string> {
    return this.stateEngine?.effectiveStates ?? this.currentStates ?? [];
  }

  get resolvedPatch(): Partial<T> | undefined {
    return this.stateEngine?.resolvedPatch;
  }

  private sameStates(left: readonly string[], right: readonly string[]): boolean {
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
}
