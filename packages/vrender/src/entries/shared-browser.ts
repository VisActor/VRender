import type { IApp, IEntryOptions, IEnvParamsMap } from '@visactor/vrender-core';
import { createBrowserApp } from '@visactor/vrender-core/entries/browser';
import { bootstrapVRenderSharedBrowserApp } from './bootstrap-browser';
import { installPendingRuntimeContributionModulesToApp } from './runtime-contribution';
import {
  acquireSharedApp,
  getSharedApp,
  releaseSharedApp,
  type TVRenderSharedAppHandle,
  type TVRenderSharedAppKey
} from './shared-registry';

const SHARED_BROWSER_REGISTRY_ENV = 'browser-shared';

export type TVRenderSharedBrowserAppEnv = 'browser';

export type TVRenderSharedBrowserAppOptions<TEnv extends TVRenderSharedBrowserAppEnv = 'browser'> = IEntryOptions & {
  env?: TEnv;
  envParams?: IEnvParamsMap[TEnv];
  /**
   * Shared identity inside the current JS runtime. Use a stable app/page/container key
   * when multiple products, such as VChart and VTable, should share one VRender app.
   */
  key?: TVRenderSharedAppKey;
};

export type TVRenderSharedBrowserAppHandle<TEnv extends TVRenderSharedBrowserAppEnv = 'browser'> =
  TVRenderSharedAppHandle<TEnv>;

type TVRenderSharedBrowserAppArgument = TVRenderSharedBrowserAppOptions | IEnvParamsMap['browser'];

function isSharedBrowserAppOptions(
  options: TVRenderSharedBrowserAppArgument
): options is TVRenderSharedBrowserAppOptions {
  return 'context' in options || 'env' in options || 'envParams' in options || 'key' in options;
}

function assertBrowserEnv(env: unknown): asserts env is 'browser' | undefined {
  if (env !== undefined && env !== 'browser') {
    throw new Error(`The browser condition only supports env "browser"; received "${String(env)}".`);
  }
}

function resolveSharedBrowserAppOptions(
  optionsOrEnvParams?: TVRenderSharedBrowserAppArgument,
  env?: 'browser'
): TVRenderSharedBrowserAppOptions {
  assertBrowserEnv(env);
  if (env !== undefined) {
    return { env, envParams: optionsOrEnvParams as IEnvParamsMap['browser'] | undefined };
  }

  if (optionsOrEnvParams === undefined) {
    return { env: 'browser' };
  }

  if (isSharedBrowserAppOptions(optionsOrEnvParams)) {
    assertBrowserEnv((optionsOrEnvParams as { env?: unknown }).env);
    return { ...optionsOrEnvParams, env: 'browser' };
  }

  return { env: 'browser', envParams: optionsOrEnvParams };
}

function createSharedBrowserApp(options: TVRenderSharedBrowserAppOptions): IApp {
  const { envParams } = options;
  const entryOptions = { ...options };
  delete entryOptions.env;
  delete entryOptions.envParams;
  delete entryOptions.key;

  const app = bootstrapVRenderSharedBrowserApp(createBrowserApp(entryOptions as any) as unknown as IApp, envParams);

  installPendingRuntimeContributionModulesToApp(app);
  return app;
}

export function acquireSharedBrowserVRenderApp(
  options?: TVRenderSharedBrowserAppOptions
): TVRenderSharedBrowserAppHandle;
export function acquireSharedBrowserVRenderApp(
  envParams?: IEnvParamsMap['browser'],
  env?: 'browser'
): TVRenderSharedBrowserAppHandle;
export function acquireSharedBrowserVRenderApp(
  optionsOrEnvParams?: TVRenderSharedBrowserAppArgument,
  env?: 'browser'
): TVRenderSharedBrowserAppHandle {
  const options = resolveSharedBrowserAppOptions(optionsOrEnvParams, env);
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
