import * as VRenderCore from '@visactor/vrender-core';
import type { IApp, IEntryOptions, IEnvParamsMap } from '@visactor/vrender-core';
import { bootstrapVRenderSharedBrowserApp } from './bootstrap-browser';
import {
  acquireSharedApp,
  getSharedApp,
  releaseSharedApp,
  type TVRenderSharedAppHandle,
  type TVRenderSharedAppKey
} from './shared-registry';

const SHARED_BROWSER_REGISTRY_ENV = 'browser-shared';

export type TVRenderSharedBrowserAppOptions = IEntryOptions & {
  env?: 'browser';
  envParams?: IEnvParamsMap['browser'];
  /**
   * Shared identity inside the current JS runtime. Use a stable app/page/container key
   * when multiple products, such as VChart and VTable, should share one VRender app.
   */
  key?: TVRenderSharedAppKey;
};

export type TVRenderSharedBrowserAppHandle = TVRenderSharedAppHandle<'browser'>;

const { createBrowserApp } = VRenderCore as typeof VRenderCore & {
  createBrowserApp: (options?: IEntryOptions) => IApp;
};

function createSharedBrowserApp(options: TVRenderSharedBrowserAppOptions): IApp {
  const { envParams } = options;
  const entryOptions = { ...options };
  delete entryOptions.env;
  delete entryOptions.envParams;
  delete entryOptions.key;

  return bootstrapVRenderSharedBrowserApp(createBrowserApp(entryOptions), envParams);
}

export function acquireSharedBrowserVRenderApp(
  options: TVRenderSharedBrowserAppOptions = {}
): TVRenderSharedBrowserAppHandle {
  return acquireSharedApp(SHARED_BROWSER_REGISTRY_ENV, options, createSharedBrowserApp, 'browser');
}

export function getSharedBrowserVRenderApp(key?: TVRenderSharedAppKey): IApp | null {
  return getSharedApp(SHARED_BROWSER_REGISTRY_ENV, key);
}

export function releaseSharedBrowserVRenderApp(key?: TVRenderSharedAppKey): void {
  releaseSharedApp(SHARED_BROWSER_REGISTRY_ENV, key);
}

export {
  acquireSharedBrowserVRenderApp as acquireSharedVRenderApp,
  getSharedBrowserVRenderApp as getSharedVRenderApp,
  releaseSharedBrowserVRenderApp as releaseSharedVRenderApp
};
