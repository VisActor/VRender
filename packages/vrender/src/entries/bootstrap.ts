import {
  getLegacyBindingContext,
  GraphicRender,
  isBrowserEnv,
  isNodeEnv,
  registerDirectionalLight,
  registerFlexLayoutPlugin,
  registerHtmlAttributePlugin,
  registerOrthoCamera,
  registerReactAttributePlugin,
  registerViewTransform3dPlugin
} from '@visactor/vrender-core';
import {
  installBrowserEnvToApp,
  installBrowserPickersToApp,
  installDefaultGraphicsToApp,
  installNodeEnvToApp,
  installNodePickersToApp,
  CanvasPickerContribution,
  loadBrowserEnv,
  MathPickerContribution,
  loadNodeEnv,
  registerArc,
  registerArc3d,
  registerArea,
  registerCircle,
  registerGlyph,
  registerGifImage,
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
  registerStar,
  registerSymbol,
  registerText,
  registerWrapText
} from '@visactor/vrender-kits';
import { registerCustomAnimate, registerAnimate } from '@visactor/vrender-animate';

const BOOTSTRAP_STATE = Symbol.for('vrender.bootstrap.state');

type TBootstrapTarget = Record<string | symbol, unknown> & {
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

const animationRegistrations = [registerCustomAnimate, registerAnimate];

const legacyGraphicRegistrations = [
  registerArc,
  registerArc3d,
  registerArea,
  registerCircle,
  registerGlyph,
  registerGifImage,
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

function ensureBootstrap(target: TBootstrapTarget, key: string): boolean {
  const state = target[BOOTSTRAP_STATE] ?? new Set<string>();
  target[BOOTSTRAP_STATE] = state;

  if (state.has(key)) {
    return false;
  }

  state.add(key);
  return true;
}

function registerDefaultPipeline(): void {
  pluginRegistrations.forEach(register => register());
  animationRegistrations.forEach(register => register());
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

export function bootstrapVRenderBrowserApp<TApp extends object>(app: TApp): TApp {
  const target = app as TBootstrapTarget;

  if (!ensureBootstrap(target, 'browser')) {
    return app;
  }

  installBrowserEnvToApp(app as any);
  installDefaultGraphicsToApp(app as any);
  installBrowserPickersToApp(app as any);
  loadBrowserEnv();
  legacyGraphicRegistrations.forEach(register => register());
  syncLegacyRenderersToApp(app as any);
  syncLegacyPickersToApp(app as any, CanvasPickerContribution);
  registerDefaultPipeline();
  return app;
}

export function bootstrapVRenderNodeApp<TApp extends object>(app: TApp): TApp {
  const target = app as TBootstrapTarget;

  if (!ensureBootstrap(target, 'node')) {
    return app;
  }

  installNodeEnvToApp(app as any);
  installDefaultGraphicsToApp(app as any);
  installNodePickersToApp(app as any);
  loadNodeEnv();
  legacyGraphicRegistrations.forEach(register => register());
  syncLegacyRenderersToApp(app as any);
  syncLegacyPickersToApp(app as any, MathPickerContribution);
  registerDefaultPipeline();
  return app;
}

export function bootstrapLegacyVRenderRuntime(): void {
  if (isBrowserEnv()) {
    loadBrowserEnv();
  } else if (isNodeEnv()) {
    loadNodeEnv();
  }

  legacyGraphicRegistrations.forEach(register => register());
  registerDefaultPipeline();
}
