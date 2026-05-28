import {
  registerDirectionalLight,
  registerOrthoCamera,
  registerViewTransform3dPlugin
} from '@visactor/vrender-core/plugin/3d';
import { getLegacyBindingContext } from '@visactor/vrender-core/legacy/bootstrap';
import { GraphicRender } from '@visactor/vrender-core/render/symbol';
import { registerHtmlAttributePlugin, registerReactAttributePlugin } from '@visactor/vrender-core/plugin/attribute';
import { registerFlexLayoutPlugin } from '@visactor/vrender-core/plugin/flex-layout';
import { registerArc } from '@visactor/vrender-kits/register/register-arc';
import { registerArc3d } from '@visactor/vrender-kits/register/register-arc3d';
import { registerArea } from '@visactor/vrender-kits/register/register-area';
import { registerCircle } from '@visactor/vrender-kits/register/register-circle';
import { registerGlyph } from '@visactor/vrender-kits/register/register-glyph';
import { registerGroup } from '@visactor/vrender-kits/register/register-group';
import { registerImage } from '@visactor/vrender-kits/register/register-image';
import { registerLine } from '@visactor/vrender-kits/register/register-line';
import { registerPath } from '@visactor/vrender-kits/register/register-path';
import { registerPolygon } from '@visactor/vrender-kits/register/register-polygon';
import { registerPyramid3d } from '@visactor/vrender-kits/register/register-pyramid3d';
import { registerRect } from '@visactor/vrender-kits/register/register-rect';
import { registerRect3d } from '@visactor/vrender-kits/register/register-rect3d';
import { registerRichtext } from '@visactor/vrender-kits/register/register-richtext';
import { registerShadowRoot } from '@visactor/vrender-kits/register/register-shadowRoot';
import { registerStar } from '@visactor/vrender-kits/register/register-star';
import { registerSymbol } from '@visactor/vrender-kits/register/register-symbol';
import { registerText } from '@visactor/vrender-kits/register/register-text';
import { registerWrapText } from '@visactor/vrender-kits/register/register-wraptext';
import { registerAnimate } from '@visactor/vrender-animate/register';

export const BOOTSTRAP_STATE = Symbol.for('vrender.bootstrap.state');

export type TBootstrapTarget = Record<string | symbol, unknown> & {
  [BOOTSTRAP_STATE]?: Set<string>;
};

const pluginRegistrations = [
  registerFlexLayoutPlugin,
  registerViewTransform3dPlugin,
  registerHtmlAttributePlugin,
  registerReactAttributePlugin,
  registerDirectionalLight,
  registerOrthoCamera
];

const standardLegacyGraphicRegistrations = [
  registerArc,
  registerArc3d,
  registerArea,
  registerCircle,
  registerGlyph,
  registerGroup,
  registerImage,
  registerLine,
  registerPath,
  registerPolygon,
  registerPyramid3d,
  registerRect,
  registerRect3d,
  registerRichtext,
  registerShadowRoot,
  registerSymbol,
  registerText,
  registerWrapText,
  registerStar
];

export function ensureBootstrap(target: TBootstrapTarget, key: string): boolean {
  const state = target[BOOTSTRAP_STATE] ?? new Set<string>();
  target[BOOTSTRAP_STATE] = state;

  if (state.has(key)) {
    return false;
  }

  state.add(key);
  return true;
}

export function registerStandardPipeline(): void {
  pluginRegistrations.forEach(register => register());
  registerAnimate();
}

export function registerStandardLegacyGraphics(): void {
  standardLegacyGraphicRegistrations.forEach(register => register());
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
