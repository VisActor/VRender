import coreModule from '../core/core-modules';
import renderModule from '../render/render-modules';
import pickModule from '../picker/pick-modules';
import graphicModule from '../graphic/graphic-service/graphic-module';
import pluginModule from '../plugins/plugin-modules';
import loadBuiltinContributions from '../core/contributions/modules';
import loadRenderContributions from '../render/contributions/modules';
import type { ILegacyBindContext, ILegacyBindingContext } from './binding-context';
import { getLegacyBootstrapState } from './bootstrap-state';

export type { ILegacyBindContext, ILegacyBindingContext } from './binding-context';

const legacyBootstrapState = getLegacyBootstrapState();
const legacyBindingContext = legacyBootstrapState.legacyBindingContext;

function getLegacyTarget<T>(resolver: () => T): () => T {
  let target: T | undefined;

  return () => {
    if (target === undefined) {
      target = resolver();
    }

    return target;
  };
}

export function preLoadAllModule() {
  if (legacyBootstrapState.preloaded) {
    return;
  }
  legacyBootstrapState.preloaded = true;
  coreModule({ bind: legacyBindingContext.bind });
  graphicModule({ bind: legacyBindingContext.bind });
  renderModule({ bind: legacyBindingContext.bind });
  pickModule({ bind: legacyBindingContext.bind, isBound: legacyBindingContext.isBound });
  pluginModule({ bind: legacyBindingContext.bind });
  loadBuiltinContributions(legacyBindingContext);
  loadRenderContributions(legacyBindingContext);
}

export function getLegacyBindingContext(): ILegacyBindingContext {
  return legacyBindingContext;
}

export function resolveLegacySingleton<T>(serviceIdentifier: any): T {
  preLoadAllModule();
  const [instance] = legacyBindingContext.getAll<T>(serviceIdentifier);
  return instance;
}

export { LEGACY_BOOTSTRAP_STATE_SYMBOL, getLegacyBootstrapState } from './bootstrap-state';
export type { ILegacyBootstrapState } from './bootstrap-state';

export function resolveLegacyNamed<T>(serviceIdentifier: any, name: string): T | undefined {
  preLoadAllModule();
  return legacyBindingContext.getNamed<T>(serviceIdentifier, name);
}

export function createLegacySingletonProxy<T extends object>(resolver: () => T): T {
  const getTarget = getLegacyTarget(resolver);

  return new Proxy({} as T, {
    get(_target, property) {
      const value = (getTarget() as any)[property];
      return typeof value === 'function' ? value.bind(getTarget()) : value;
    },
    set(_target, property, value) {
      (getTarget() as any)[property] = value;
      return true;
    },
    has(_target, property) {
      return property in (getTarget() as any);
    },
    ownKeys() {
      return Reflect.ownKeys(getTarget() as any);
    },
    getOwnPropertyDescriptor(_target, property) {
      const descriptor = Object.getOwnPropertyDescriptor(getTarget() as any, property);

      if (!descriptor) {
        return undefined;
      }

      return {
        ...descriptor,
        configurable: true
      };
    }
  });
}
