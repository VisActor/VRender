import type { IApp, IEntryOptions, IEnvParamsMap } from '@visactor/vrender-core';
import { createBrowserApp } from '@visactor/vrender-core/entries/browser';
import { bootstrapVRenderSharedBrowserLiteApp } from './bootstrap-browser-lite';
import { installPendingRuntimeContributionModulesToApp } from './runtime-contribution';
import {
  acquireSharedApp,
  getSharedApp,
  releaseSharedApp,
  type TVRenderSharedAppHandle,
  type TVRenderSharedAppKey
} from './shared-registry';

const SHARED_BROWSER_LITE_REGISTRY_ENV = 'browser-lite-shared';

export type TVRenderSharedBrowserLiteAppOptions = IEntryOptions & {
  env?: 'browser';
  envParams?: IEnvParamsMap['browser'];
  /**
   * Shared identity inside the current JS runtime. Use a stable app/page/container key
   * when multiple products, such as VChart and VTable, should share one VRender app.
   */
  key?: TVRenderSharedAppKey;
};

export type TVRenderSharedBrowserLiteAppHandle = TVRenderSharedAppHandle<'browser'>;

function createSharedBrowserLiteApp(options: TVRenderSharedBrowserLiteAppOptions): IApp {
  const { envParams } = options;
  const entryOptions = { ...options };
  delete entryOptions.env;
  delete entryOptions.envParams;
  delete entryOptions.key;
  const app = bootstrapVRenderSharedBrowserLiteApp(createBrowserApp(entryOptions as any) as unknown as IApp, envParams);

  installPendingRuntimeContributionModulesToApp(app);
  return app;
}

export function acquireSharedBrowserLiteVRenderApp(
  options: TVRenderSharedBrowserLiteAppOptions = {}
): TVRenderSharedBrowserLiteAppHandle {
  return acquireSharedApp(SHARED_BROWSER_LITE_REGISTRY_ENV, options, createSharedBrowserLiteApp, 'browser');
}

export function getSharedBrowserLiteVRenderApp(key?: TVRenderSharedAppKey): IApp | null {
  return getSharedApp(SHARED_BROWSER_LITE_REGISTRY_ENV, key);
}

export function releaseSharedBrowserLiteVRenderApp(key?: TVRenderSharedAppKey): void {
  releaseSharedApp(SHARED_BROWSER_LITE_REGISTRY_ENV, key);
}

export {
  acquireSharedBrowserLiteVRenderApp as acquireSharedVRenderApp,
  getSharedBrowserLiteVRenderApp as getSharedVRenderApp,
  releaseSharedBrowserLiteVRenderApp as releaseSharedVRenderApp
};
