import {
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
  loadBrowserEnv,
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

const graphicRegistrations = [
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

const pluginRegistrations = [
  registerFlexLayoutPlugin,
  registerViewTransform3dPlugin,
  registerHtmlAttributePlugin,
  registerReactAttributePlugin,
  registerDirectionalLight,
  registerOrthoCamera
];

const animationRegistrations = [registerCustomAnimate, registerAnimate];

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
  graphicRegistrations.forEach(register => register());
  pluginRegistrations.forEach(register => register());
  animationRegistrations.forEach(register => register());
}

export function bootstrapVRenderBrowserApp<TApp extends object>(app: TApp): TApp {
  const target = app as TBootstrapTarget;

  if (!ensureBootstrap(target, 'browser')) {
    return app;
  }

  loadBrowserEnv();
  registerDefaultPipeline();
  return app;
}

export function bootstrapVRenderNodeApp<TApp extends object>(app: TApp): TApp {
  const target = app as TBootstrapTarget;

  if (!ensureBootstrap(target, 'node')) {
    return app;
  }

  loadNodeEnv();
  registerDefaultPipeline();
  return app;
}

export function bootstrapLegacyVRenderRuntime(): void {
  if (isBrowserEnv()) {
    loadBrowserEnv();
  } else if (isNodeEnv()) {
    loadNodeEnv();
  }

  registerDefaultPipeline();
}
