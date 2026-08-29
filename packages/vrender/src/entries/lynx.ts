import type { IApp, IEntryOptions, IEnvParamsMap } from '@visactor/vrender-core';
import { createMiniappApp } from '@visactor/vrender-core/entries/miniapp';
import { bootstrapVRenderLynxApp } from './bootstrap-lynx';
import { installPendingRuntimeContributionModulesToApp } from './runtime-contribution';

export type TVRenderLynxAppEntryOptions = IEntryOptions & {
  envParams?: IEnvParamsMap['lynx'];
};

export function createLynxVRenderApp(options: TVRenderLynxAppEntryOptions = {}): IApp {
  const { envParams, ...entryOptions } = options;
  const app = bootstrapVRenderLynxApp(createMiniappApp(entryOptions) as IApp, envParams);

  installPendingRuntimeContributionModulesToApp(app);
  return app;
}
