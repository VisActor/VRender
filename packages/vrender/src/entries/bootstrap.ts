import {
  getLegacyBindingContext,
  GraphicRender,
  vglobal,
  isBrowserEnv,
  isNodeEnv,
  registerDirectionalLight,
  registerFlexLayoutPlugin,
  registerHtmlAttributePlugin,
  registerOrthoCamera,
  registerReactAttributePlugin,
  registerViewTransform3dPlugin,
  type IEnvParamsMap
} from '@visactor/vrender-core';
import {
  installBrowserEnvToApp,
  installBrowserPickersToApp,
  installDefaultGraphicsToApp,
  installFeishuEnvToApp,
  installHarmonyEnvToApp,
  installLynxEnvToApp,
  installMathPickersToApp,
  installNodeEnvToApp,
  installNodePickersToApp,
  installTaroEnvToApp,
  installTTEnvToApp,
  installWxEnvToApp
} from '@visactor/vrender-kits/installers/app';
import { loadBrowserEnv } from '@visactor/vrender-kits/env/browser';
import { loadFeishuEnv } from '@visactor/vrender-kits/env/feishu';
import { loadHarmonyEnv } from '@visactor/vrender-kits/env/harmony';
import { loadLynxEnv } from '@visactor/vrender-kits/env/lynx';
import { loadNodeEnv } from '@visactor/vrender-kits/env/node';
import { loadTaroEnv } from '@visactor/vrender-kits/env/taro';
import { loadTTEnv } from '@visactor/vrender-kits/env/tt';
import { loadWxEnv } from '@visactor/vrender-kits/env/wx';
import {
  CanvasPickerContribution,
  MathPickerContribution
} from '@visactor/vrender-kits/picker/contributions/constants';
import { registerArc } from '@visactor/vrender-kits/register/register-arc';
import { registerArc3d } from '@visactor/vrender-kits/register/register-arc3d';
import { registerArea } from '@visactor/vrender-kits/register/register-area';
import { registerCircle } from '@visactor/vrender-kits/register/register-circle';
import { registerGlyph } from '@visactor/vrender-kits/register/register-glyph';
import { registerGifImage } from '@visactor/vrender-kits/register/register-gif';
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
import { registerCustomAnimate } from '@visactor/vrender-animate/custom/register';
import { registerAnimate } from '@visactor/vrender-animate/register';

const BOOTSTRAP_STATE = Symbol.for('vrender.bootstrap.state');
const installBrowserEnvToAppWithParams = installBrowserEnvToApp as (
  app: any,
  envParams?: IEnvParamsMap['browser']
) => void;
const installNodeEnvToAppWithParams = installNodeEnvToApp as (app: any, envParams?: IEnvParamsMap['node']) => void;
type TAppScopedMiniEnv = 'taro' | 'feishu' | 'tt' | 'wx' | 'lynx' | 'harmony';
type TAppScopedMiniEnvInstaller<TEnv extends TAppScopedMiniEnv> = (app: any, envParams?: IEnvParamsMap[TEnv]) => void;
type TAppScopedMiniEnvBootstrap<TEnv extends TAppScopedMiniEnv> = {
  installEnv: TAppScopedMiniEnvInstaller<TEnv>;
  loadEnv: () => void;
};
type TAppScopedMiniEnvBootstraps = {
  [TEnv in TAppScopedMiniEnv]: TAppScopedMiniEnvBootstrap<TEnv>;
};
const miniEnvBootstraps: TAppScopedMiniEnvBootstraps = {
  taro: { installEnv: installTaroEnvToApp, loadEnv: loadTaroEnv },
  feishu: { installEnv: installFeishuEnvToApp, loadEnv: loadFeishuEnv },
  tt: { installEnv: installTTEnvToApp, loadEnv: loadTTEnv },
  wx: { installEnv: installWxEnvToApp, loadEnv: loadWxEnv },
  lynx: { installEnv: installLynxEnvToApp, loadEnv: loadLynxEnv },
  harmony: { installEnv: installHarmonyEnvToApp, loadEnv: loadHarmonyEnv }
};

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

export function bootstrapVRenderBrowserApp<TApp extends object>(app: TApp, envParams?: IEnvParamsMap['browser']): TApp {
  const target = app as TBootstrapTarget;

  if (!ensureBootstrap(target, 'browser')) {
    return app;
  }

  if (envParams === undefined) {
    installBrowserEnvToApp(app as any);
  } else {
    installBrowserEnvToAppWithParams(app as any, envParams);
  }
  installDefaultGraphicsToApp(app as any);
  installBrowserPickersToApp(app as any);
  loadBrowserEnv();
  legacyGraphicRegistrations.forEach(register => register());
  syncLegacyRenderersToApp(app as any);
  syncLegacyPickersToApp(app as any, CanvasPickerContribution);
  registerDefaultPipeline();
  return app;
}

function resolveNodeEnvParams(envParams?: IEnvParamsMap['node']): IEnvParamsMap['node'] | undefined {
  if (envParams != null) {
    return envParams;
  }

  return vglobal?.env === 'node' ? vglobal.envParams : undefined;
}

export function bootstrapVRenderNodeApp<TApp extends object>(app: TApp, envParams?: IEnvParamsMap['node']): TApp {
  const target = app as TBootstrapTarget;

  if (!ensureBootstrap(target, 'node')) {
    return app;
  }

  const resolvedEnvParams = resolveNodeEnvParams(envParams);
  if (resolvedEnvParams === undefined) {
    installNodeEnvToApp(app as any);
  } else {
    installNodeEnvToAppWithParams(app as any, resolvedEnvParams);
  }
  installDefaultGraphicsToApp(app as any);
  installNodePickersToApp(app as any);
  loadNodeEnv();
  legacyGraphicRegistrations.forEach(register => register());
  syncLegacyRenderersToApp(app as any);
  syncLegacyPickersToApp(app as any, MathPickerContribution);
  registerDefaultPipeline();
  return app;
}

export function bootstrapVRenderMiniApp<TEnv extends TAppScopedMiniEnv, TApp extends object>(
  app: TApp,
  env: TEnv,
  envParams?: IEnvParamsMap[TEnv]
): TApp {
  const target = app as TBootstrapTarget;

  if (!ensureBootstrap(target, env)) {
    return app;
  }

  const bootstrap = miniEnvBootstraps[env];
  bootstrap.installEnv(app as any, envParams);
  installDefaultGraphicsToApp(app as any);
  installMathPickersToApp(app as any);
  bootstrap.loadEnv();
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
