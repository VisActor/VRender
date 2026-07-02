import type { IGlobal, IDrawItemInterceptorContribution } from '../interface';
import { createLegacyBindingContext, type ILegacyBindingContext } from '../legacy/binding-context';

export const RUNTIME_INSTALLER_STATE_SYMBOL = Symbol.for('@visactor/vrender-core/runtime-installer-state');

export interface IRuntimeInstallerState {
  runtimeInstallerContext: ILegacyBindingContext;
  preloaded: boolean;
  runtimeGlobal?: IGlobal;
  runtimeEntryKeys: WeakMap<object, Map<string, Set<string>>>;
  runtimeDrawContributions: WeakMap<object, Set<IDrawItemInterceptorContribution>>;
  loadedRuntimeContributionModules: WeakMap<object, WeakSet<object>>;
}

function createRuntimeInstallerState(): IRuntimeInstallerState {
  return {
    runtimeInstallerContext: createLegacyBindingContext(),
    preloaded: false,
    runtimeEntryKeys: new WeakMap<object, Map<string, Set<string>>>(),
    runtimeDrawContributions: new WeakMap<object, Set<IDrawItemInterceptorContribution>>(),
    loadedRuntimeContributionModules: new WeakMap<object, WeakSet<object>>()
  };
}

export function getRuntimeInstallerState(): IRuntimeInstallerState {
  const scope = globalThis as typeof globalThis & { [RUNTIME_INSTALLER_STATE_SYMBOL]?: IRuntimeInstallerState };

  if (!scope[RUNTIME_INSTALLER_STATE_SYMBOL]) {
    scope[RUNTIME_INSTALLER_STATE_SYMBOL] = createRuntimeInstallerState();
  }

  return scope[RUNTIME_INSTALLER_STATE_SYMBOL] as IRuntimeInstallerState;
}
