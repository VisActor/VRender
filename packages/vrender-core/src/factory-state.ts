export const FACTORY_STATE_SYMBOL = Symbol.for('@visactor/vrender-core/factory-state');

export interface IFactoryState {
  pluginClasses: Record<string, any>;
}

function createFactoryState(): IFactoryState {
  return {
    pluginClasses: {}
  };
}

export function getFactoryState(): IFactoryState {
  const scope = globalThis as typeof globalThis & { [FACTORY_STATE_SYMBOL]?: IFactoryState };

  if (!scope[FACTORY_STATE_SYMBOL]) {
    scope[FACTORY_STATE_SYMBOL] = createFactoryState();
  }

  return scope[FACTORY_STATE_SYMBOL] as IFactoryState;
}
