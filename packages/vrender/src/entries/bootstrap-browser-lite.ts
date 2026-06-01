import type { IEnvParamsMap } from '@visactor/vrender-core';
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
import {
  ensureBootstrap,
  syncLegacyPickersToApp,
  syncLegacyRenderersToApp,
  type TBootstrapTarget
} from './bootstrap-utils';

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

function registerLitePipeline(): void {
  litePipelineRegistrations.forEach(register => register());
  registerAnimate();
}

function registerLiteLegacyGraphics(): void {
  liteLegacyGraphicRegistrations.forEach(register => register());
}

export function bootstrapVRenderSharedBrowserLiteApp<TApp extends object>(
  app: TApp,
  envParams?: IEnvParamsMap['browser']
): TApp {
  const target = app as TBootstrapTarget;

  if (!ensureBootstrap(target, 'browser-lite-shared')) {
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
