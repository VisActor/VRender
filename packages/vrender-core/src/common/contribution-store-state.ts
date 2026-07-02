import type { ServiceIdentifier } from './explicit-binding';

export const CONTRIBUTION_STORE_STATE_SYMBOL = Symbol.for('@visactor/vrender-core/contribution-store-state');

export interface IContributionStoreState<T = any> {
  store: Map<ServiceIdentifier<T>, Set<T>>;
}

function createContributionStoreState(): IContributionStoreState {
  return {
    store: new Map()
  };
}

export function getContributionStoreState(): IContributionStoreState {
  const scope = globalThis as typeof globalThis & { [CONTRIBUTION_STORE_STATE_SYMBOL]?: IContributionStoreState };

  if (!scope[CONTRIBUTION_STORE_STATE_SYMBOL]) {
    scope[CONTRIBUTION_STORE_STATE_SYMBOL] = createContributionStoreState();
  }

  return scope[CONTRIBUTION_STORE_STATE_SYMBOL] as IContributionStoreState;
}
