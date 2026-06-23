import type { IEnvParamsMap } from '@visactor/vrender-core';
import { installBrowserEnvToApp, installBrowserPickersToApp } from '@visactor/vrender-kits/installers/browser';
import { installStandardGraphicsToApp } from '@visactor/vrender-kits/installers/graphics';
import { CanvasPickerContribution } from '@visactor/vrender-kits/picker/contributions/constants';
import {
  ensureBootstrap,
  registerStandardLegacyGraphics,
  registerStandardPipeline,
  syncLegacyPickersToApp,
  syncLegacyRenderersToApp,
  type TBootstrapTarget
} from './bootstrap-common';

export function bootstrapVRenderSharedBrowserApp<TApp extends object>(
  app: TApp,
  envParams?: IEnvParamsMap['browser']
): TApp {
  const target = app as TBootstrapTarget;

  if (!ensureBootstrap(target, 'browser-shared')) {
    return app;
  }

  installBrowserEnvToApp(app as any, envParams);
  installStandardGraphicsToApp(app as any);
  installBrowserPickersToApp(app as any);
  registerStandardLegacyGraphics();
  syncLegacyRenderersToApp(app as any);
  syncLegacyPickersToApp(app as any, CanvasPickerContribution);
  registerStandardPipeline();
  return app;
}
