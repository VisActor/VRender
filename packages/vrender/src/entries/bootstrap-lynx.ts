import type { IEnvParamsMap } from '@visactor/vrender-core';
import { registerCustomAnimate } from '@visactor/vrender-animate/custom/register';
import { loadLynxEnv } from '@visactor/vrender-kits/env/lynx';
import { installStandardGraphicsToApp } from '@visactor/vrender-kits/installers/graphics';
import { installLynxEnvToApp, installLynxPickersToApp } from '@visactor/vrender-kits/installers/lynx';
import { MathPickerContribution } from '@visactor/vrender-kits/picker/contributions/constants';
import { registerGifImage } from '@visactor/vrender-kits/register/register-gif';
import {
  ensureBootstrap,
  registerStandardAnimation,
  registerStandardLegacyGraphics,
  registerStandardPlugins,
  syncLegacyPickersToApp,
  syncLegacyRenderersToApp,
  type TBootstrapTarget
} from './bootstrap-common';

export function bootstrapVRenderLynxApp<TApp extends object>(app: TApp, envParams?: IEnvParamsMap['lynx']): TApp {
  const target = app as TBootstrapTarget;

  if (!ensureBootstrap(target, 'lynx')) {
    return app;
  }

  installLynxEnvToApp(app as any, envParams);
  installStandardGraphicsToApp(app as any);
  installLynxPickersToApp(app as any);
  loadLynxEnv();
  registerStandardLegacyGraphics();
  registerGifImage();
  syncLegacyRenderersToApp(app as any);
  syncLegacyPickersToApp(app as any, MathPickerContribution);
  registerStandardPlugins();
  registerCustomAnimate();
  registerStandardAnimation();
  return app;
}
