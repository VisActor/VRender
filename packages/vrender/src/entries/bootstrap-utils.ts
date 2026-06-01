import { getLegacyBindingContext } from '@visactor/vrender-core/legacy/bootstrap';
import { GraphicRender } from '@visactor/vrender-core/render/symbol';

export const BOOTSTRAP_STATE = Symbol.for('vrender.bootstrap.state');

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

export function syncLegacyRenderersToApp(app: any): void {
  const legacyContext = getLegacyBindingContext();
  const existing = app.registry.renderer.getAll?.() ?? [];
  const legacyRenderers = legacyContext.getAll(GraphicRender) ?? [];
  const merged = [...existing, ...legacyRenderers];
  const seen = new Set<string>();

  app.registry.renderer.clear();
  merged.forEach((renderer: any) => {
    const key = createBootstrapEntryKey(renderer, 'renderer');
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    renderer?.reInit?.();
    app.registry.renderer.register(key, renderer);
  });
}

export function syncLegacyPickersToApp(app: any, pickerContribution: symbol): void {
  const legacyContext = getLegacyBindingContext();
  const existing = app.registry.picker.getAll?.() ?? [];
  const legacyPickers = legacyContext.getAll(pickerContribution) ?? [];
  const merged = [...existing, ...legacyPickers];
  const seen = new Set<string>();

  app.registry.picker.clear();
  merged.forEach((picker: any) => {
    const key = createBootstrapEntryKey(picker, 'picker');
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    app.registry.picker.register(key, picker);
  });
}
