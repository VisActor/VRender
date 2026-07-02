import { createLegacyBindingContext, type ILegacyBindingContext } from './binding-context';

export const LEGACY_BOOTSTRAP_STATE_SYMBOL = Symbol.for('@visactor/vrender-core/legacy-bootstrap-state');

export interface ILegacyBootstrapState {
  legacyBindingContext: ILegacyBindingContext;
  preloaded: boolean;
}

function createLegacyBootstrapState(): ILegacyBootstrapState {
  return {
    legacyBindingContext: createLegacyBindingContext(),
    preloaded: false
  };
}

export function getLegacyBootstrapState(): ILegacyBootstrapState {
  const scope = globalThis as typeof globalThis & { [LEGACY_BOOTSTRAP_STATE_SYMBOL]?: ILegacyBootstrapState };

  if (!scope[LEGACY_BOOTSTRAP_STATE_SYMBOL]) {
    scope[LEGACY_BOOTSTRAP_STATE_SYMBOL] = createLegacyBootstrapState();
  }

  return scope[LEGACY_BOOTSTRAP_STATE_SYMBOL] as ILegacyBootstrapState;
}
