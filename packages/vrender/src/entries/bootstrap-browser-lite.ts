import type { IEnvParamsMap } from '@visactor/vrender-core';
import { getLegacyBindingContext } from '@visactor/vrender-core/legacy/bootstrap';
import { GraphicRender } from '@visactor/vrender-core/render/symbol';
import { registerHtmlAttributePlugin, registerReactAttributePlugin } from '@visactor/vrender-core/plugin/attribute';
import { registerFlexLayoutPlugin } from '@visactor/vrender-core/plugin/flex-layout';
import { registerArea } from '@visactor/vrender-kits/register/register-area';
import { registerCircle } from '@visactor/vrender-kits/register/register-circle';
import { registerGlyph } from '@visactor/vrender-kits/register/register-glyph';
import { registerGroup } from '@visactor/vrender-kits/register/register-group';
import { registerLine } from '@visactor/vrender-kits/register/register-line';
import { registerRect } from '@visactor/vrender-kits/register/register-rect';
import { registerShadowRoot } from '@visactor/vrender-kits/register/register-shadowRoot';
import { registerSymbol } from '@visactor/vrender-kits/register/register-symbol';
import { registerText } from '@visactor/vrender-kits/register/register-text';
import { registerWrapText } from '@visactor/vrender-kits/register/register-wraptext';
import {
  installBrowserLiteEnvToApp,
  installBrowserLitePickersToApp
} from '@visactor/vrender-kits/installers/browser-lite';
import { installLiteGraphicsToApp } from '@visactor/vrender-kits/installers/graphics-lite';
import { CanvasPickerContribution } from '@visactor/vrender-kits/picker/contributions/constants';
import { registerAnimate } from '@visactor/vrender-animate/register';

const BOOTSTRAP_LITE_STATE = Symbol.for('vrender.bootstrap.state');

type TBootstrapLiteTarget = Record<string | symbol, unknown> & {
  [BOOTSTRAP_LITE_STATE]?: Set<string>;
};

const litePipelineRegistrations = [registerFlexLayoutPlugin, registerHtmlAttributePlugin, registerReactAttributePlugin];

const liteLegacyGraphicRegistrations = [
  registerArea,
  registerCircle,
  registerGlyph,
  registerGroup,
  registerLine,
  registerRect,
  registerShadowRoot,
  registerSymbol,
  registerText,
  registerWrapText
];

function ensureLiteBootstrap(target: TBootstrapLiteTarget, key: string): boolean {
  const state = target[BOOTSTRAP_LITE_STATE] ?? new Set<string>();
  target[BOOTSTRAP_LITE_STATE] = state;

  if (state.has(key)) {
    return false;
  }

  state.add(key);
  return true;
}

function registerLitePipeline(): void {
  litePipelineRegistrations.forEach(register => register());
  registerAnimate();
}

function registerLiteLegacyGraphics(): void {
  liteLegacyGraphicRegistrations.forEach(register => register());
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

function syncLegacyRenderersToApp(app: any): void {
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

function syncLegacyPickersToApp(app: any, pickerContribution: symbol): void {
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

export function bootstrapVRenderSharedBrowserLiteApp<TApp extends object>(
  app: TApp,
  envParams?: IEnvParamsMap['browser']
): TApp {
  const target = app as TBootstrapLiteTarget;

  if (!ensureLiteBootstrap(target, 'browser-lite-shared')) {
    return app;
  }

  installBrowserLiteEnvToApp(app as any, envParams);
  installLiteGraphicsToApp(app as any);
  installBrowserLitePickersToApp(app as any);
  registerLiteLegacyGraphics();
  syncLegacyRenderersToApp(app as any);
  syncLegacyPickersToApp(app as any, CanvasPickerContribution);
  registerLitePipeline();
  return app;
}
