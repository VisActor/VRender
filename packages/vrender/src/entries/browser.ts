import type { IApp, IEntryOptions, IEnvParamsMap } from '@visactor/vrender-core';
import { createBrowserApp } from '@visactor/vrender-core/entries/browser';
import { bootstrapVRenderBrowserApp } from './bootstrap';
import { installPendingRuntimeContributionModulesToApp } from './runtime-contribution';

export type TVRenderBrowserAppEntryOptions = IEntryOptions & {
  envParams?: IEnvParamsMap['browser'];
};

export function createBrowserVRenderApp(options: TVRenderBrowserAppEntryOptions = {}): IApp {
  const { envParams, ...entryOptions } = options;
  const app = bootstrapVRenderBrowserApp(createBrowserApp(entryOptions as any) as unknown as IApp, envParams);

  installPendingRuntimeContributionModulesToApp(app);
  return app;
}
