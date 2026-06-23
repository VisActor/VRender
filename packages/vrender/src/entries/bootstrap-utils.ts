import { getLegacyBindingContext } from '@visactor/vrender-core/legacy/bootstrap';
import { GraphicRender } from '@visactor/vrender-core/render/symbol';

export const BOOTSTRAP_STATE = Symbol.for('vrender.bootstrap.state');
const LEGACY_RENDERER_NAMESPACE = 'vrender:legacy-renderer';
const LEGACY_PICKER_NAMESPACE = 'vrender:legacy-picker';
const legacyEntryKeys = new WeakMap<object, Map<string, Set<string>>>();

export type TBootstrapTarget = Record<string | symbol, unknown> & {
  [BOOTSTRAP_STATE]?: Set<string>;
};

export function ensureBootstrap(target: TBootstrapTarget, key: string): boolean {
  const state = target[BOOTSTRAP_STATE] ?? new Set<string>();
  target[BOOTSTRAP_STATE] = state;

  if (state.has(key)) {
    return false;
  }

  state.add(key);
  return true;
}

function createBootstrapEntryKey(
  entry: { type?: string; numberType?: number; constructor?: { name?: string } },
  prefix: string
) {
  const type = entry?.type ?? 'unknown';
  const numberType = entry?.numberType ?? 'unknown';
  const ctor = entry?.constructor?.name ?? 'anonymous';
  return `${prefix}:${String(numberType)}:${String(type)}:${ctor}`;
}

function getTrackedEntryKeys(registry: object, namespace: string): Set<string> {
  let namespaces = legacyEntryKeys.get(registry);
  if (!namespaces) {
    namespaces = new Map();
    legacyEntryKeys.set(registry, namespaces);
  }

  let keys = namespaces.get(namespace);
  if (!keys) {
    keys = new Set();
    namespaces.set(namespace, keys);
  }

  return keys;
}

function clearTrackedEntryKeys(registry: object, namespace: string, unregister?: (key: string) => void): void {
  const keys = getTrackedEntryKeys(registry, namespace);
  if (unregister) {
    keys.forEach(key => unregister(key));
  }
  keys.clear();
}

export function syncLegacyRenderersToApp(app: any): void {
  const legacyContext = getLegacyBindingContext();
  const legacyRenderers = legacyContext.getAll(GraphicRender) ?? [];
  const registeredKeys = getTrackedEntryKeys(app.registry.renderer, LEGACY_RENDERER_NAMESPACE);
  const seen = new Set<string>();

  clearTrackedEntryKeys(
    app.registry.renderer,
    LEGACY_RENDERER_NAMESPACE,
    app.registry.renderer.unregister?.bind(app.registry.renderer)
  );
  legacyRenderers.forEach((renderer: any) => {
    const key = createBootstrapEntryKey(renderer, LEGACY_RENDERER_NAMESPACE);
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    renderer?.reInit?.();
    app.registry.renderer.register(key, renderer);
    registeredKeys.add(key);
  });
}

export function syncLegacyPickersToApp(app: any, pickerContribution: symbol): void {
  const legacyContext = getLegacyBindingContext();
  const legacyPickers = legacyContext.getAll(pickerContribution) ?? [];
  const registeredKeys = getTrackedEntryKeys(app.registry.picker, LEGACY_PICKER_NAMESPACE);
  const seen = new Set<string>();

  clearTrackedEntryKeys(
    app.registry.picker,
    LEGACY_PICKER_NAMESPACE,
    app.registry.picker.unregister?.bind(app.registry.picker)
  );
  legacyPickers.forEach((picker: any) => {
    const key = createBootstrapEntryKey(picker, LEGACY_PICKER_NAMESPACE);
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    app.registry.picker.register(key, picker);
    registeredKeys.add(key);
  });
}
